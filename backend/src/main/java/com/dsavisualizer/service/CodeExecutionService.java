package com.dsavisualizer.service;

import com.dsavisualizer.dto.*;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CodeExecutionService {

    private static final Logger log = LoggerFactory.getLogger(CodeExecutionService.class);

    private final Judge0Service judge0Service;
    private final PracticeProblemRepository problemRepository;
    private final ObjectMapper objectMapper;
    private final CodeWrapperService codeWrapperService;

    public CodeExecutionService(Judge0Service judge0Service,
                                PracticeProblemRepository problemRepository,
                                ObjectMapper objectMapper,
                                CodeWrapperService codeWrapperService) {
        this.judge0Service    = judge0Service;
        this.problemRepository = problemRepository;
        this.objectMapper     = objectMapper;
        this.codeWrapperService = codeWrapperService;
    }

    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        // 1) Fetch problem
        PracticeProblem problem = problemRepository
                .findById(request.getProblemId())
                .orElse(null);
        if (problem == null) {
            return new CodeExecutionResponse(
                    false,
                    Collections.emptyList(),
                    false,
                    null,
                    0.0,
                    0
            );
        }

        try {
            // 2) Get test cases from DB
            List<Map<String, Object>> testCases = problem.getTestCases();
            if (testCases == null || testCases.isEmpty()) {
                return new CodeExecutionResponse(
                        false,
                        Collections.emptyList(),
                        false,
                        null,
                        0.0,
                        0
                );
            }

            // 3) Resolve language
            String lang = request.getLanguage().toLowerCase();
            int langId  = judge0Service.getLanguageId(lang);
            if (langId == 0) {
                return new CodeExecutionResponse(
                        false,
                        Collections.emptyList(),
                        false,
                        null,
                        0.0,
                        0
                );
            }

            // 4) Loop through every test case
            List<TestCaseResult> results = new ArrayList<>();
            boolean allPassed = true;
            double totalRuntime = 0.0;
            int maxMemory = 0;

            for (int i = 0; i < testCases.size(); i++) {
                Map<String, Object> tc = testCases.get(i);

                // a) Build stdin
                Object inField      = tc.get("input");
                Object inArgsField  = tc.get("inputArgs");
                String stdin;
                if (inArgsField != null) {
                    // Special handling for C++ single-parameter problems
                    if (lang.equals("cpp") || lang.equals("c++")) {
                        if (problem.getMethodSignature() != null && problem.getMethodSignature().getParameters().size() == 1 && inArgsField instanceof java.util.List inArgsList && inArgsList.size() == 1) {
                            String paramType = problem.getMethodSignature().getParameters().get(0).getType();
                            if (paramType.endsWith("[][]") || paramType.startsWith("vector<vector<") || paramType.startsWith("List<List<")) {
                                // 2D array: serialize the whole array
                                stdin = objectMapper.writeValueAsString(inArgsField);
                            } else {
                                // Scalar or 1D: serialize just the first element
                                stdin = objectMapper.writeValueAsString(inArgsList.get(0));
                            }
                        } else {
                            stdin = objectMapper.writeValueAsString(inArgsField);
                        }
                    } else {
                        stdin = objectMapper.writeValueAsString(inArgsField);
                    }
                } else {
                    stdin = (inField instanceof String)
                            ? (String) inField
                            : objectMapper.writeValueAsString(inField);
                }

                // b) Expected output
                Object outField = tc.get("output");
                String expect;
                if (outField instanceof Map) {
                    // Language-specific expected output
                    Map<?,?> outMap = (Map<?,?>) outField;
                    Object langExpect = outMap.get(lang);
                    if (langExpect == null) {
                        // Fallback: use the first value or null
                        langExpect = outMap.values().stream().findFirst().orElse(null);
                    }
                    expect = (langExpect == null) ? null : (langExpect instanceof String ? (String) langExpect : objectMapper.writeValueAsString(langExpect));
                } else if (outField instanceof String) {
                    expect = (String) outField;
                } else {
                    expect = objectMapper.writeValueAsString(outField);
                }

                // c) Wrap user code using the scalable wrapper service
                String userCode = request.getCode();
                String methodName = problem.getMethodName();
                MethodSignature methodSignature = problem.getMethodSignature();
                
                String fullSource;
                if (methodSignature != null) {
                    // Use the new scalable wrapper
                    fullSource = codeWrapperService.wrapCode(userCode, methodName, methodSignature, lang);
                } else {
                    // This should not happen since all problems have method signatures
                    throw new RuntimeException("No method signature found for problem: " + problem.getTitle());
                }


                // d) Submit & wait
                Judge0SubmissionRequest subReq = new Judge0SubmissionRequest(
                        fullSource,
                        langId,
                        stdin
                );
                Judge0Result jr = judge0Service
                        .submitAndWait(subReq)
                        .block();

                // Aggregate runtime and memory
                if (jr != null) {
                    if (jr.time() != null) totalRuntime += jr.time();
                    if (jr.memory() != null && jr.memory() > maxMemory) maxMemory = jr.memory().intValue();
                }

                // e) Collect stdout/stderr
                String actual = jr.stdout() != null
                        ? jr.stdout().trim()
                        : "";
                String stderr = (jr.stderr() != null ? jr.stderr().trim() : "");
                String compileOutput = (jr.compile_output() != null ? jr.compile_output().trim() : "");
                // Log stderr and compile output for debugging
                if (!stderr.isEmpty()) {
                    log.warn("Judge0 stderr (test case {}): {}", i + 1, stderr);
                }
                if (!compileOutput.isEmpty()) {
                    log.warn("Judge0 compile_output (test case {}): {}", i + 1, compileOutput);
                }
                String errorMsg = "";
                if (!stderr.isEmpty() && !compileOutput.isEmpty()) {
                    errorMsg = stderr + "\n" + compileOutput;
                } else if (!stderr.isEmpty()) {
                    errorMsg = stderr;
                } else if (!compileOutput.isEmpty()) {
                    errorMsg = compileOutput;
                }

                // Fallback: If all outputs are empty, set a generic error message
                boolean passedCase;
                if ((actual.isEmpty()) && (errorMsg.isEmpty())) {
                    errorMsg = "Code did not compile.";
                    passedCase = false;
                } else {
                    // f) Determine pass/fail
                    boolean isBooleanExpected = "true".equalsIgnoreCase(expect) || "false".equalsIgnoreCase(expect);
                    if (isBooleanExpected) {
                        String actualNorm = actual.trim().replaceAll("^\"|\"$", "").toLowerCase();
                        String expectNorm = expect.trim().replaceAll("^\"|\"$", "").toLowerCase();
                        passedCase = jr.status() != null && jr.status().id() == 3
                                && actualNorm.equals(expectNorm);
                    } else {
                        boolean areEqual;
                        try {
                            Object actualObj = objectMapper.readValue(actual, Object.class);
                            Object expectObj = objectMapper.readValue(expect, Object.class);
                            areEqual = Objects.equals(actualObj, expectObj);
                        } catch (Exception e) {
                            // Fallback to string comparison if not valid JSON
                            areEqual = actual.equals(expect);
                        }
                        passedCase = jr.status() != null && jr.status().id() == 3 && areEqual;
                    }
                }

                if (!passedCase) {
                    allPassed = false;
                }

                // g) Record this test‐case
                results.add(new TestCaseResult(
                        i + 1,
                        stdin,
                        actual,
                        errorMsg,
                        passedCase
                ));
            }

            // 5) Return aggregated results
            return new CodeExecutionResponse(
                    true,
                    results,
                    allPassed,
                    null,
                    totalRuntime,
                    maxMemory
            );

        } catch (Exception e) {
            // On any error, return a single test-case result with the error message
            List<TestCaseResult> errorResults = new ArrayList<>();
            errorResults.add(new TestCaseResult(
                1,
                "", // stdin unknown
                "",
                "Internal error: " + e.getMessage(),
                false
            ));
            return new CodeExecutionResponse(
                false,
                errorResults,
                false,
                null,
                0.0,
                0
            );
        }
    }
}
