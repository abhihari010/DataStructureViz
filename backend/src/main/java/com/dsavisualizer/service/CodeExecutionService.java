package com.dsavisualizer.service;

import com.dsavisualizer.dto.CodeExecutionRequest;
import com.dsavisualizer.dto.CodeExecutionResponse;
import com.dsavisualizer.dto.ExecutionReceipt;
import com.dsavisualizer.dto.ExecutionStatus;
import com.dsavisualizer.dto.Judge0FailureType;
import com.dsavisualizer.dto.Judge0Result;
import com.dsavisualizer.dto.Judge0SubmissionRequest;
import com.dsavisualizer.dto.MethodSignature;
import com.dsavisualizer.dto.TestCaseResult;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class CodeExecutionService {
    private static final Logger log = LoggerFactory.getLogger(CodeExecutionService.class);
    private static final int MAX_CODE_CHARS = 100_000;
    private static final int MAX_WRAPPED_SOURCE_CHARS = 150_000;
    private static final int MAX_TEST_CASES = 20;
    private static final int MAX_INPUT_CHARS = 16_000;
    private static final int MAX_OUTPUT_CHARS = 4_000;
    private static final Duration RECEIPT_TTL = Duration.ofMinutes(10);
    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("java", "python", "javascript", "cpp", "c++");

    private final Judge0Service judge0Service;
    private final PracticeProblemRepository problemRepository;
    private final ObjectMapper objectMapper;
    private final CodeWrapperService codeWrapperService;

    public CodeExecutionService(Judge0Service judge0Service,
                                PracticeProblemRepository problemRepository,
                                ObjectMapper objectMapper,
                                CodeWrapperService codeWrapperService) {
        this.judge0Service = judge0Service;
        this.problemRepository = problemRepository;
        this.objectMapper = objectMapper;
        this.codeWrapperService = codeWrapperService;
    }

    /** Compatibility overload for callers that do not yet pass the authenticated subject. */
    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        return executeCode(request, null);
    }

    public CodeExecutionResponse executeCode(CodeExecutionRequest request, String authenticatedSubject) {
        String validationError = validateRequest(request);
        if (validationError != null) {
            return CodeExecutionResponse.failure(ExecutionStatus.VALIDATION_ERROR, validationError);
        }

        PracticeProblem problem = problemRepository.findById(request.getProblemId()).orElse(null);
        if (problem == null) {
            return CodeExecutionResponse.failure(ExecutionStatus.PROBLEM_NOT_FOUND, "Problem was not found");
        }

        List<Map<String, Object>> testCases = problem.getTestCases();
        if (testCases == null || testCases.isEmpty()) {
            return CodeExecutionResponse.failure(ExecutionStatus.NO_TEST_CASES, "This problem has no executable test cases");
        }
        if (testCases.size() > MAX_TEST_CASES) {
            return CodeExecutionResponse.failure(ExecutionStatus.VALIDATION_ERROR, "Problem has too many test cases");
        }

        String language = request.getLanguage().trim().toLowerCase();
        int languageId = judge0Service.getLanguageId(language);
        if (languageId == 0 || !SUPPORTED_LANGUAGES.contains(language)) {
            return CodeExecutionResponse.failure(ExecutionStatus.VALIDATION_ERROR, "Unsupported language");
        }

        String fullSource;
        try {
            MethodSignature signature = problem.getMethodSignature();
            if (signature == null) {
                return CodeExecutionResponse.failure(ExecutionStatus.INTERNAL_ERROR, "Problem execution metadata is unavailable");
            }
            fullSource = codeWrapperService.wrapCode(request.getCode(), problem.getMethodName(), signature, language);
        } catch (Exception exception) {
            log.warn("Code execution wrapper rejected problemId={} language={}", problem.getId(), language);
            return CodeExecutionResponse.failure(ExecutionStatus.VALIDATION_ERROR, "Code could not be prepared for execution");
        }
        if (fullSource == null || fullSource.length() > MAX_WRAPPED_SOURCE_CHARS) {
            return CodeExecutionResponse.failure(ExecutionStatus.VALIDATION_ERROR, "Code is too large after preparation");
        }

        List<TestCaseResult> results = new ArrayList<>();
        boolean allPassed = true;
        double totalRuntime = 0.0;
        int maxMemory = 0;
        ExecutionStatus aggregateStatus = ExecutionStatus.ACCEPTED;
        String firstError = null;

        for (int index = 0; index < testCases.size(); index++) {
            Map<String, Object> testCase = testCases.get(index);
            try {
                String stdin = serializeInput(testCase, problem, language);
                String expected = serializeExpected(testCase.get("output"), language);
                Judge0Result judgeResult = judge0Service
                        .submitAndWait(new Judge0SubmissionRequest(fullSource, languageId, stdin))
                        .block();

                if (judgeResult == null || judgeResult.status() == null || judgeResult.status().id() == null) {
                    return providerFailure(results, ExecutionStatus.PROVIDER_ERROR, "Execution provider returned an invalid result",
                            totalRuntime, maxMemory);
                }

                if (judgeResult.time() != null) {
                    totalRuntime += judgeResult.time();
                }
                if (judgeResult.memory() != null) {
                    maxMemory = Math.max(maxMemory, judgeResult.memory().intValue());
                }

                ExecutionStatus caseStatus = statusForJudge0(judgeResult.status().id());
                String actual = safeText(judgeResult.stdout());
                String error = safeText(firstNonBlank(judgeResult.stderr(), judgeResult.compile_output()));
                boolean passed = caseStatus == ExecutionStatus.ACCEPTED && outputsMatch(actual, expected);
                if (!passed) {
                    allPassed = false;
                }
                if (caseStatus != ExecutionStatus.ACCEPTED) {
                    aggregateStatus = moreSpecific(aggregateStatus, caseStatus);
                } else if (!passed) {
                    aggregateStatus = moreSpecific(aggregateStatus, ExecutionStatus.WRONG_ANSWER);
                }
                if (firstError == null && !error.isBlank()) {
                    firstError = error;
                }
                results.add(new TestCaseResult(index + 1, safeText(stdin), actual, error, passed));

                // A compile/provider failure is identical for every test case and should not consume quota.
                if (caseStatus == ExecutionStatus.COMPILE_ERROR || caseStatus == ExecutionStatus.PROVIDER_ERROR
                        || caseStatus == ExecutionStatus.PROVIDER_QUOTA || caseStatus == ExecutionStatus.TIME_LIMIT_EXCEEDED
                        || caseStatus == ExecutionStatus.RUNTIME_ERROR) {
                    break;
                }
            } catch (Judge0ProviderException exception) {
                ExecutionStatus failureStatus = statusForProviderFailure(exception.getFailureType());
                log.warn("Judge0 execution failed: status={} problemId={} language={}", failureStatus, problem.getId(), language);
                return providerFailure(results, failureStatus, safeProviderMessage(failureStatus), totalRuntime, maxMemory);
            } catch (IllegalArgumentException exception) {
                return CodeExecutionResponse.failure(ExecutionStatus.VALIDATION_ERROR, "Test case input is too large or invalid");
            } catch (Exception exception) {
                log.warn("Code execution failed internally: problemId={} language={}", problem.getId(), language);
                return providerFailure(results, ExecutionStatus.INTERNAL_ERROR, "Execution could not be completed",
                        totalRuntime, maxMemory);
            }
        }

        String error = firstError;
        boolean completed = aggregateStatus == ExecutionStatus.ACCEPTED || aggregateStatus == ExecutionStatus.WRONG_ANSWER;
        ExecutionReceipt receipt = allPassed
                ? createReceipt(request, language, authenticatedSubject)
                : null;
        return new CodeExecutionResponse(
                "v1",
                receipt,
                aggregateStatus,
                aggregateStatus == ExecutionStatus.ACCEPTED ? null : aggregateStatus.name(),
                completed,
                results,
                allPassed,
                null,
                totalRuntime,
                maxMemory,
                error
        );
    }

    private String validateRequest(CodeExecutionRequest request) {
        if (request == null || request.getProblemId() == null || request.getProblemId() <= 0) {
            return "A valid problemId is required";
        }
        if (request.getCode() == null || request.getCode().isBlank() || request.getCode().length() > MAX_CODE_CHARS) {
            return "Code must be non-empty and at most 100000 characters";
        }
        if (request.getLanguage() == null || request.getLanguage().isBlank() || request.getLanguage().length() > 20) {
            return "A valid language is required";
        }
        try {
            if (request.getInput() != null && objectMapper.writeValueAsString(request.getInput()).length() > MAX_INPUT_CHARS) {
                return "Input is too large";
            }
            if (request.getExpectedOutput() != null
                    && objectMapper.writeValueAsString(request.getExpectedOutput()).length() > MAX_INPUT_CHARS) {
                return "Expected output is too large";
            }
        } catch (Exception exception) {
            return "Request input is invalid";
        }
        return null;
    }

    private String serializeInput(Map<String, Object> testCase, PracticeProblem problem, String language) throws Exception {
        if (testCase == null) {
            throw new IllegalArgumentException("Missing test case");
        }
        Object inputArgs = testCase.get("inputArgs");
        Object input = testCase.get("input");
        Object value = inputArgs != null ? inputArgs : input;
        MethodSignature signature = problem.getMethodSignature();
        if (inputArgs instanceof List<?> arguments && (language.equals("cpp") || language.equals("c++"))
                && signature != null && signature.getParameters() != null
                && signature.getParameters().size() == 1 && arguments.size() == 1) {
            String parameterType = signature.getParameters().get(0).getType();
            boolean twoDimensional = parameterType != null
                    && (parameterType.endsWith("[][]") || parameterType.startsWith("vector<vector<")
                    || parameterType.startsWith("List<List<"));
            value = twoDimensional ? arguments : arguments.get(0);
        }
        String stdin = value instanceof String && inputArgs == null
                ? (String) value
                : objectMapper.writeValueAsString(value);
        if (stdin.length() > MAX_INPUT_CHARS) {
            throw new IllegalArgumentException("Test input too large");
        }
        return input instanceof String && inputArgs == null ? (String) input : stdin;
    }

    private String serializeExpected(Object output, String language) throws Exception {
        Object value = output;
        if (output instanceof Map<?, ?> outputMap) {
            value = outputMap.get(language);
            if (value == null) {
                value = outputMap.values().stream().findFirst().orElse(null);
            }
        }
        String expected = value instanceof String ? (String) value : objectMapper.writeValueAsString(value);
        if (expected.length() > MAX_INPUT_CHARS) {
            throw new IllegalArgumentException("Expected output too large");
        }
        return expected;
    }

    private boolean outputsMatch(String actual, String expected) {
        if (expected == null || expected.equals("null")) {
            return actual.isBlank();
        }
        if ("true".equalsIgnoreCase(expected) || "false".equalsIgnoreCase(expected)) {
            return actual.replaceAll("^\"|\"$", "").equalsIgnoreCase(expected.replaceAll("^\"|\"$", ""));
        }
        try {
            return Objects.equals(objectMapper.readValue(actual, Object.class), objectMapper.readValue(expected, Object.class));
        } catch (Exception ignored) {
            return actual.equals(expected);
        }
    }

    private CodeExecutionResponse providerFailure(List<TestCaseResult> results, ExecutionStatus status,
                                                  String message, double runtime, int memory) {
        return new CodeExecutionResponse("v1", null, status, status.name(), false, results, false,
                null, runtime, memory, message);
    }

    private ExecutionReceipt createReceipt(CodeExecutionRequest request, String language, String authenticatedSubject) {
        // The subject is deliberately consumed only by the server-side binding layer in U3.
        // Keeping it out of the JSON contract prevents account identifiers from leaking.
        String hash = sha256(request.getCode());
        Instant issuedAt = Instant.now();
        return new ExecutionReceipt(java.util.UUID.randomUUID().toString(), request.getProblemId(), language,
                hash, true, issuedAt, issuedAt.plus(RECEIPT_TTL));
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to create execution fingerprint", exception);
        }
    }

    private ExecutionStatus statusForJudge0(int id) {
        if (id == 3) return ExecutionStatus.ACCEPTED;
        if (id == 4) return ExecutionStatus.WRONG_ANSWER;
        if (id == 5) return ExecutionStatus.TIME_LIMIT_EXCEEDED;
        if (id == 6) return ExecutionStatus.COMPILE_ERROR;
        if (id >= 7 && id <= 12) return ExecutionStatus.RUNTIME_ERROR;
        return ExecutionStatus.PROVIDER_ERROR;
    }

    private ExecutionStatus statusForProviderFailure(Judge0FailureType failureType) {
        return switch (failureType) {
            case TIMEOUT -> ExecutionStatus.TIME_LIMIT_EXCEEDED;
            case QUOTA -> ExecutionStatus.PROVIDER_QUOTA;
            case BAD_REQUEST, UNAVAILABLE, PROVIDER_ERROR -> ExecutionStatus.PROVIDER_ERROR;
        };
    }

    private ExecutionStatus moreSpecific(ExecutionStatus current, ExecutionStatus candidate) {
        List<ExecutionStatus> priority = List.of(ExecutionStatus.PROVIDER_QUOTA, ExecutionStatus.PROVIDER_ERROR,
                ExecutionStatus.TIME_LIMIT_EXCEEDED, ExecutionStatus.COMPILE_ERROR, ExecutionStatus.RUNTIME_ERROR,
                ExecutionStatus.WRONG_ANSWER, ExecutionStatus.ACCEPTED);
        return priority.indexOf(candidate) < priority.indexOf(current) ? candidate : current;
    }

    private String safeProviderMessage(ExecutionStatus status) {
        return switch (status) {
            case PROVIDER_QUOTA -> "Execution provider quota is temporarily exhausted";
            case TIME_LIMIT_EXCEEDED -> "Execution timed out; try again with a smaller input";
            case PROVIDER_ERROR -> "Execution provider is temporarily unavailable";
            default -> "Execution could not be completed";
        };
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return "";
    }

    private String safeText(String value) {
        if (value == null) return "";
        String trimmed = value.trim();
        return trimmed.length() <= MAX_OUTPUT_CHARS ? trimmed : trimmed.substring(0, MAX_OUTPUT_CHARS);
    }
}
