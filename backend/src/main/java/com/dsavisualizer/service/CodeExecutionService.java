package com.dsavisualizer.service;

import com.dsavisualizer.dto.*;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CodeExecutionService {

    private final Judge0Service judge0Service;
    private final PracticeProblemRepository problemRepository;
    private final ObjectMapper objectMapper;

    public CodeExecutionService(Judge0Service judge0Service,
                                PracticeProblemRepository problemRepository,
                                ObjectMapper objectMapper) {
        this.judge0Service    = judge0Service;
        this.problemRepository = problemRepository;
        this.objectMapper     = objectMapper;
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
            System.out.println("[DEBUG] Language: " + lang + ", Language ID: " + langId);
            if (langId == 0) {
                System.out.println("[DEBUG] Unknown language, exiting early.");
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
                if (inArgsField != null && (lang.equals("python") || lang.equals("javascript"))) {
                    stdin = objectMapper.writeValueAsString(inArgsField);
                } else {
                    stdin = (inField instanceof String)
                            ? (String) inField
                            : objectMapper.writeValueAsString(inField);
                }

                // b) Expected output
                Object outField = tc.get("output");
                String expect = (outField instanceof String)
                        ? (String) outField
                        : objectMapper.writeValueAsString(outField);

                // c) Wrap user code in a driver for this language
                String userCode  = request.getCode();
                String method    = problem.getMethodName();  // e.g. "isValid"
                String fullSource;
                switch (lang) {
                    case "python":
                        fullSource = wrapPython(userCode, method);
                        break;
                    case "java":
                        fullSource = wrapJava(userCode, method);
                        break;
                    case "javascript":
                        fullSource = wrapJavaScript(userCode, method);
                        break;
                    case "cpp":
                    case "c++":
                        fullSource = wrapCpp(userCode, method);
                        // Debug: Log the full C++ source code
                        System.out.println("[DEBUG] C++ Source Code Sent to Judge0:\n" + fullSource);
                        break;
                    default:
                        fullSource = userCode;
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
                String stderr = jr.stderr() != null
                        ? jr.stderr()
                        : jr.compile_output();

                // Fallback: If all outputs are empty, set a generic error message
                boolean passedCase;
                if ((actual.isEmpty()) &&
                        (stderr == null || stderr.isEmpty())) {
                    stderr = "No output or error. Please make sure your using the right language.";
                    passedCase = false;
                } else {
                    // f) Determine pass/fail
                    passedCase = jr.status() != null && jr.status().id() == 3
                            && actual.equals(expect);
                }

                if (!passedCase) {
                    allPassed = false;
                }

                // g) Record this test‐case
                results.add(new TestCaseResult(
                        i + 1,
                        stdin,
                        actual,
                        stderr,
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

    // ─── Wrappers ──────────────────────────────────────────────────────────────

    private String wrapPython(String userCode, String methodName) {
        return """
            import sys, json

            %s

            if __name__ == "__main__":
                raw = sys.stdin.readline().strip()
                try:
                    arg = json.loads(raw)
                except:
                    arg = raw
                # Replace 'Solution' with your actual class name
                sol = Solution()
                res = sol.%s(arg)
                if isinstance(res, bool):
                    print(str(res).lower())
                else:
                    print(json.dumps(res))
            """.formatted(userCode, methodName);
    }

    private String wrapJava(String userCode, String methodName) {
        return """
            import java.util.Scanner;

            %s

            public class Main {
                public static void main(String[] args) {
                    Scanner sc = new Scanner(System.in);
                    String s = sc.nextLine();
                    sc.close();
                    // Replace 'Solution' with your actual class name
                    Solution sol = new Solution();
                    boolean res = sol.%s(s);
                    System.out.println(res);
                }
            }
            """.formatted(userCode, methodName);
    }

    private String wrapJavaScript(String userCode, String methodName) {
        return """
            const readline = require('readline');

            %s

            (async () => {
                const rl = readline.createInterface({ input: process.stdin });
                const raw = await new Promise(res => rl.on('line', line => { rl.close(); res(line); }));
                let arg;
                try { arg = JSON.parse(raw); } catch { arg = raw; }
                // Replace 'Solution' with your actual class name
                const sol = new Solution();
                const out = sol.%s(arg);
                console.log(out);
            })();
            """.formatted(userCode, methodName);
    }

    private String wrapCpp(String userCode, String methodName) {
        return """
            #include <iostream>
            #include <string>
            using namespace std;

            %s

            int main() {
                string s;
                if (!getline(cin, s)) return 0;
                // Replace 'Solution' with your actual class name
                Solution sol;
                bool res = sol.%s(s);
                cout << (res ? "true" : "false");
                return 0;
            }
            """.formatted(userCode, methodName);
    }
}
