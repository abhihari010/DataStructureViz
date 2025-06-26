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
                    null
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
                        null
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
                        null
                );
            }

            // 4) Loop through every test case
            List<TestCaseResult> results = new ArrayList<>();
            boolean allPassed = true;

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

                // e) Collect stdout/stderr
                String actual = jr.stdout() != null
                        ? jr.stdout().trim()
                        : "";
                String stderr = jr.stderr() != null
                        ? jr.stderr()
                        : jr.compile_output();

                // f) Determine pass/fail
                boolean passedCase = jr.status().id() == 3
                        && actual.equals(expect);

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
                    null
            );

        } catch (Exception e) {
            // On any error, return an empty-results response
            return new CodeExecutionResponse(
                    false,
                    Collections.emptyList(),
                    false,
                    null
            );
        }
    }

    // ─── Wrappers ──────────────────────────────────────────────────────────────

    private String wrapPython(String userCode, String methodName) {
        String indented = Arrays.stream(userCode.split("\n"))
                .map(line -> "    " + line)
                .collect(Collectors.joining("\n"));

        return """
            import sys, json

            class Solution:
            %s

            if __name__ == "__main__":
                raw = sys.stdin.readline().strip()
                try:
                    arg = json.loads(raw)
                except:
                    arg = raw
                sol = Solution()
                res = sol.%s(arg)
                if isinstance(res, bool):
                    print(str(res).lower())
                else:
                    print(json.dumps(res))
            """.formatted(indented, methodName);
    }

    private String wrapJava(String userCode, String methodName) {
        return """
            import java.util.Scanner;

            public class Solution {
            %s

                public static void main(String[] args) {
                    Scanner sc = new Scanner(System.in);
                    String s = sc.nextLine();
                    sc.close();
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

            class Solution {
            %s
            }

            (async () => {
                const rl = readline.createInterface({ input: process.stdin });
                const raw = await new Promise(res => rl.on('line', line => { rl.close(); res(line); }));
                let arg;
                try { arg = JSON.parse(raw); } catch { arg = raw; }
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
                Solution sol;
                bool res = sol.%s(s);
                cout << (res ? "true" : "false");
                return 0;
            }
            """.formatted(userCode, methodName);
    }
}
