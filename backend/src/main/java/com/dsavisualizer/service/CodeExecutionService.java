package com.dsavisualizer.service;

import com.dsavisualizer.dto.CodeExecutionRequest;
import com.dsavisualizer.dto.CodeExecutionResponse;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class CodeExecutionService {

    private final PracticeProblemRepository problemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final long EXECUTION_TIMEOUT_SECONDS = 5;

    public CodeExecutionService(PracticeProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        String language = request.getLanguage().toLowerCase();
        return switch (language) {
            case "java" -> executeJavaCode(request);
            case "python" -> executePythonCode(request);
            case "javascript" -> executeJavaScriptCode(request);
            default -> executeCppCode(request);
        };
    }

    private CodeExecutionResponse executeJavaCode(CodeExecutionRequest request) {
        PracticeProblem problem = problemRepository.findById(request.getProblemId())
                .orElse(null);

        if (problem == null) {
            return new CodeExecutionResponse(false, "Problem with ID " + request.getProblemId() + " not found.", null, false, null);
        }

        String methodName = problem.getMethodName();
        if (methodName == null || methodName.trim().isEmpty()) {
            return new CodeExecutionResponse(false, "Execution logic not defined for this problem (missing method name).", null, false, null);
        }

        // This template assumes the method takes one String argument.
        // It can be expanded later to handle more complex signatures based on problem metadata.
        String driverCode = String.format(
            "class Solution {\n" +
            "    %s\n\n" + // User's code (the method implementation) is injected here
            "    public static void main(String[] args) {\n" +
            "        java.util.Scanner scanner = new java.util.Scanner(System.in);\n" +
            "        String input = scanner.nextLine();\n" +
            "        Solution solution = new Solution();\n" +
            "        System.out.println(solution.%s(input));\n" +
            "        scanner.close();\n" +
            "    }\n" +
            "}", request.getCode(), methodName);

        String commonImports = "import java.io.*;\n" +
                             "import java.util.*;\n" +
                             "import java.text.*;\n" +
                             "import java.math.*;\n" +
                             "import java.util.regex.*;\n\n";
        String fullCode = commonImports + driverCode;

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("java-exec-");
            Path sourceFile = tempDir.resolve("Solution.java");
            Files.write(sourceFile, fullCode.getBytes());

            // --- Compilation Step ---
            ProcessBuilder compileBuilder = new ProcessBuilder("javac", sourceFile.toString());
            Process compileProcess = compileBuilder.start();
            boolean compileFinished = compileProcess.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!compileFinished) {
                compileProcess.destroyForcibly();
                return new CodeExecutionResponse(false, "Compilation timed out.", null, false, null);
            }

            if (compileProcess.exitValue() != 0) {
                String compileError;
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(compileProcess.getErrorStream()))) {
                    compileError = reader.lines().collect(Collectors.joining("\n"));
                }
                return new CodeExecutionResponse(false, "Compilation Error: \n" + compileError, null, false, null);
            }

            // --- Execution Step ---
            ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", tempDir.toString(), "Solution");
            Process runProcess = runBuilder.start();

            // Asynchronously read stdout and stderr to prevent buffer overflow and deadlocks
            StringBuilder outputBuilder = new StringBuilder();
            StringBuilder errorBuilder = new StringBuilder();

            Thread outputThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        outputBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    outputBuilder.append("Error reading output stream: ").append(e.getMessage()).append("\n");
                }
            });

            Thread errorThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        errorBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    errorBuilder.append("Error reading error stream: ").append(e.getMessage()).append("\n");
                }
            });

            // Start both threads
            outputThread.start();
            errorThread.start();

            // Write input to the process's standard input
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                Object input = request.getInput();
                writer.write(String.valueOf(input)); // Pass input as a simple string
                writer.newLine();
                writer.flush(); // Make sure to flush the buffer
            } catch (IOException e) {
                errorBuilder.append("Error writing input: ").append(e.getMessage()).append("\n");
            }

            // Wait for the process to complete with a timeout
            boolean runFinished = runProcess.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!runFinished) {
                runProcess.destroyForcibly();
                return new CodeExecutionResponse(false, "Execution timed out.", null, false, null);
            }

            // Wait for the threads to finish reading
            outputThread.join(2000);
            errorThread.join(2000);

            String output = outputBuilder.toString().trim();
            String error = errorBuilder.toString().trim();

            if (runProcess.exitValue() != 0) {
                return new CodeExecutionResponse(false, "Runtime Error: \n" + error, output, false, null);
            }

            // --- Comparison Step ---
            String expectedOutputStr = String.valueOf(request.getExpectedOutput());
            boolean passed = output.equals(expectedOutputStr);

            return new CodeExecutionResponse(true, output, null, passed, expectedOutputStr);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return new CodeExecutionResponse(false, "An internal server error occurred: " + e.getMessage(), null, false, null);
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                         .sorted(Comparator.reverseOrder())
                         .map(Path::toFile)
                         .forEach(File::delete);
                } catch (IOException e) {
                    System.err.println("Failed to clean up temporary directory: " + tempDir + " due to " + e.getMessage());
                }
            }
        }
    }

    private CodeExecutionResponse executePythonCode(CodeExecutionRequest req) {
        PracticeProblem problem = problemRepository.findById(req.getProblemId())
                .orElse(null);

        if (problem == null) {
            return new CodeExecutionResponse(false, "Problem with ID " + req.getProblemId() + " not found.", null, false, null);
        }

        String methodName = problem.getMethodName();
        if (methodName == null || methodName.trim().isEmpty()) {
            return new CodeExecutionResponse(false, "Execution logic not defined for this problem (missing method name).", null, false, null);
        }

        String indentedUserCode = req.getCode().trim().indent(4);

        String driverScript = String.format(
            """
            import sys
            import json

            class Solution:
            %s

            if __name__ == '__main__':
                try:
                    line = sys.stdin.readline()
                    if not line:
                        parsed_input = None
                    else:
                        parsed_input = json.loads(line)

                    solution = Solution()
                    method_to_call = getattr(solution, "%s")

                    if isinstance(parsed_input, list):
                        result = method_to_call(*parsed_input)
                    else:
                        if parsed_input is None and method_to_call.__code__.co_argcount == 1:
                            result = method_to_call()
                        else:
                            result = method_to_call(parsed_input)

                    if result is None:
                        print("null")
                    elif isinstance(result, bool):
                        print(str(result).lower())
                    elif isinstance(result, (list, dict)):
                        print(json.dumps(result, separators=(',', ':')))
                    else:
                        print(result)
                except Exception as e:
                    print(f"Error during execution: {e}", file=sys.stderr)
                    sys.exit(1)
            """, indentedUserCode, methodName);

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("py-exec-");
            Path scriptFile = tempDir.resolve("solution.py");
            Files.writeString(scriptFile, driverScript);

            ProcessBuilder pb = new ProcessBuilder("python3", scriptFile.toString());
            Process process = pb.start();

            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                String inputJson = objectMapper.writeValueAsString(req.getInput());
                writer.write(inputJson);
                writer.flush();
            }

            StringBuilder outputBuilder = new StringBuilder();
            StringBuilder errorBuilder = new StringBuilder();
            Thread outputThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        outputBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    outputBuilder.append("Error reading output stream: ").append(e.getMessage()).append("\n");
                }
            });

            Thread errorThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        errorBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    errorBuilder.append("Error reading error stream: ").append(e.getMessage()).append("\n");
                }
            });
            outputThread.start();
            errorThread.start();

            boolean finished = process.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                return new CodeExecutionResponse(false, "Execution timed out.", null, false, null);
            }

            outputThread.join(1000);
            errorThread.join(1000);

            String output = outputBuilder.toString().trim();
            String error = errorBuilder.toString().trim();

            if (process.exitValue() != 0) {
                return new CodeExecutionResponse(false, "Runtime Error: " + error, output, false, null);
            }

            String expectedOutputStr;
            Object expected = req.getExpectedOutput();
            if (expected instanceof String) {
                expectedOutputStr = (String) expected;
            } else {
                expectedOutputStr = objectMapper.writeValueAsString(expected);
            }

            if (expectedOutputStr.equalsIgnoreCase("true") || expectedOutputStr.equalsIgnoreCase("false")) {
                expectedOutputStr = expectedOutputStr.toLowerCase();
            }

            boolean passed = output.equals(expectedOutputStr);

            return new CodeExecutionResponse(true, output, null, passed, expectedOutputStr);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return new CodeExecutionResponse(false, "An internal server error occurred: " + e.getMessage(), null, false, null);
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                         .sorted(Comparator.reverseOrder())
                         .map(Path::toFile)
                         .forEach(File::delete);
                } catch (IOException e) {
                    System.err.println("Failed to clean up temporary directory: " + tempDir + " due to " + e.getMessage());
                }
            }
        }
    }
    private CodeExecutionResponse executeJavaScriptCode(CodeExecutionRequest request) {
        PracticeProblem problem = problemRepository.findById(request.getProblemId())
                .orElse(null);

        if (problem == null) {
            return new CodeExecutionResponse(false, "Problem with ID " + request.getProblemId() + " not found.", null, false, null);
        }

        String methodName = problem.getMethodName();
        if (methodName == null || methodName.trim().isEmpty()) {
            return new CodeExecutionResponse(false, "Execution logic not defined for this problem (missing method name).", null, false, null);
        }

        // Create a driver script that wraps the user's code
        String driverScript = String.format(
                """
                const fs = require('fs');
                const readline = require('readline');
                
                class Solution {
                    %s
                }
                
                async function main() {
                    try {
                        const rl = readline.createInterface({
                            input: process.stdin,
                            output: process.stdout
                        });
                        
                        const input = await new Promise((resolve) => {
                            rl.on('line', (line) => {
                                rl.close();
                                resolve(line);
                            });
                        });
                        
                        let parsedInput;
                        try {
                            parsedInput = JSON.parse(input);
                        } catch (e) {
                            // If JSON parsing fails, treat as string
                            parsedInput = input;
                        }
                        
                        const solution = new Solution();
                        const methodToCall = solution.%s;
                        
                        let result;
                        if (Array.isArray(parsedInput)) {
                            result = methodToCall.apply(solution, parsedInput);
                        } else {
                            result = methodToCall.call(solution, parsedInput);
                        }
                        
                        // Handle different result types for consistent output
                        if (result === null || result === undefined) {
                            console.log('null');
                        } else if (typeof result === 'boolean') {
                            console.log(result.toString().toLowerCase());
                        } else if (typeof result === 'object') {
                            console.log(JSON.stringify(result));
                        } else {
                            console.log(result);
                        }
                        
                    } catch (error) {
                        console.error(`Error during execution: ${error.message}`);
                        process.exit(1);
                    }
                }
                
                main();
                """, request.getCode(), methodName);

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("js-exec-");
            Path scriptFile = tempDir.resolve("solution.js");
            Files.writeString(scriptFile, driverScript);

            // Execute using Node.js
            ProcessBuilder pb = new ProcessBuilder("node", scriptFile.toString());
            Process process = pb.start();

            // Write input to the process
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                String inputJson = objectMapper.writeValueAsString(request.getInput());
                writer.write(inputJson);
                writer.flush();
            }

            // Read output and error streams asynchronously
            StringBuilder outputBuilder = new StringBuilder();
            StringBuilder errorBuilder = new StringBuilder();

            Thread outputThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        outputBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    outputBuilder.append("Error reading output stream: ").append(e.getMessage()).append("\n");
                }
            });

            Thread errorThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        errorBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    errorBuilder.append("Error reading error stream: ").append(e.getMessage()).append("\n");
                }
            });

            outputThread.start();
            errorThread.start();

            // Wait for process completion with timeout
            boolean finished = process.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                return new CodeExecutionResponse(false, "Execution timed out.", null, false, null);
            }

            // Wait for threads to finish reading
            outputThread.join(1000);
            errorThread.join(1000);

            String output = outputBuilder.toString().trim();
            String error = errorBuilder.toString().trim();

            if (process.exitValue() != 0) {
                return new CodeExecutionResponse(false, "Runtime Error: " + error, output, false, null);
            }

            // Compare with expected output
            String expectedOutputStr;
            Object expected = request.getExpectedOutput();
            if (expected instanceof String) {
                expectedOutputStr = (String) expected;
            } else {
                expectedOutputStr = objectMapper.writeValueAsString(expected);
            }

            // Handle boolean comparison (convert to lowercase)
            if (expectedOutputStr.equalsIgnoreCase("true") || expectedOutputStr.equalsIgnoreCase("false")) {
                expectedOutputStr = expectedOutputStr.toLowerCase();
            }

            boolean passed = output.equals(expectedOutputStr);

            return new CodeExecutionResponse(true, output, null, passed, expectedOutputStr);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return new CodeExecutionResponse(false, "An internal server error occurred: " + e.getMessage(), null, false, null);
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                } catch (IOException e) {
                    System.err.println("Failed to clean up temporary directory: " + tempDir + " due to " + e.getMessage());
                }
            }
        }
    }
    private CodeExecutionResponse executeCppCode(CodeExecutionRequest request) {
        PracticeProblem problem = problemRepository.findById(request.getProblemId())
                .orElse(null);

        if (problem == null) {
            return new CodeExecutionResponse(false, "Problem with ID " + request.getProblemId() + " not found.", null, false, null);
        }

        String methodName = problem.getMethodName();
        if (methodName == null || methodName.trim().isEmpty()) {
            return new CodeExecutionResponse(false, "Execution logic not defined for this problem (missing method name).", null, false, null);
        }

        // Create driver code that wraps the user's code
        String driverCode = String.format(
                """
                #include <iostream>
                #include <string>
                #include <vector>
                #include <algorithm>
                #include <map>
                #include <set>
                #include <unordered_map>
                #include <unordered_set>
                #include <queue>
                #include <stack>
                #include <deque>
                #include <cmath>
                #include <climits>
                #include <sstream>
                #include <fstream>
                
                // JSON parsing utility functions
                std::string trim(const std::string& str) {
                    size_t first = str.find_first_not_of(' ');
                    if (std::string::npos == first) {
                        return str;
                    }
                    size_t last = str.find_last_not_of(' ');
                    return str.substr(first, (last - first + 1));
                }
                
                std::vector<std::string> parseStringArray(const std::string& input) {
                    std::vector<std::string> result;
                    std::string cleanInput = trim(input);
                    if (cleanInput.front() == '[' && cleanInput.back() == ']') {
                        cleanInput = cleanInput.substr(1, cleanInput.length() - 2);
                        std::stringstream ss(cleanInput);
                        std::string item;
                        while (std::getline(ss, item, ',')) {
                            item = trim(item);
                            if (!item.empty() && item.front() == '\"' && item.back() == '\"') {
                                item = item.substr(1, item.length() - 2);
                            }
                            result.push_back(item);
                        }
                    }
                    return result;
                }
                
                std::vector<int> parseIntArray(const std::string& input) {
                    std::vector<int> result;
                    std::string cleanInput = trim(input);
                    if (cleanInput.front() == '[' && cleanInput.back() == ']') {
                        cleanInput = cleanInput.substr(1, cleanInput.length() - 2);
                        std::stringstream ss(cleanInput);
                        std::string item;
                        while (std::getline(ss, item, ',')) {
                            item = trim(item);
                            if (!item.empty()) {
                                result.push_back(std::stoi(item));
                            }
                        }
                    }
                    return result;
                }
                
                bool isStringArray(const std::string& input) {
                    std::string cleanInput = trim(input);
                    if (cleanInput.length() < 2) return false;
                    if (cleanInput.front() != '[' || cleanInput.back() != ']') return false;
                    return cleanInput.find('\"') != std::string::npos;
                }
                
                bool isIntArray(const std::string& input) {
                    std::string cleanInput = trim(input);
                    if (cleanInput.length() < 2) return false;
                    if (cleanInput.front() != '[' || cleanInput.back() != ']') return false;
                    return cleanInput.find('\"') == std::string::npos;
                }
                
                class Solution {
                public:
                    %s
                };
                
                int main() {
                    std::string input;
                    std::getline(std::cin, input);
                    
                    Solution solution;
                    
                    try {
                        // Handle different input types and call the appropriate method
                        %s
                    } catch (const std::exception& e) {
                        std::cerr << "Error during execution: " << e.what() << std::endl;
                        return 1;
                    }
                    
                    return 0;
                }
                """,
                request.getCode(),
                generateMethodCall(methodName, request.getInput()));

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("cpp-exec-");
            Path sourceFile = tempDir.resolve("solution.cpp");
            Files.writeString(sourceFile, driverCode);

            // Compilation step
            ProcessBuilder compileBuilder = new ProcessBuilder(
                    "g++", "-std=c++17", "-O2", "-o",
                    tempDir.resolve("solution").toString(),
                    sourceFile.toString()
            );
            Process compileProcess = compileBuilder.start();

            boolean compileFinished = compileProcess.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!compileFinished) {
                compileProcess.destroyForcibly();
                return new CodeExecutionResponse(false, "Compilation timed out.", null, false, null);
            }

            if (compileProcess.exitValue() != 0) {
                StringBuilder compileErrorBuilder = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(compileProcess.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        compileErrorBuilder.append(line).append("\n");
                    }
                }
                String compileError = compileErrorBuilder.toString();
                return new CodeExecutionResponse(false, "Compilation Error:\n" + compileError, null, false, null);
            }

            // Execution step
            ProcessBuilder runBuilder = new ProcessBuilder(tempDir.resolve("solution").toString());
            Process runProcess = runBuilder.start();

            // Write input to the process
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                String inputJson = objectMapper.writeValueAsString(request.getInput());
                writer.write(inputJson);
                writer.newLine();
                writer.flush();
            }

            // Read output and error streams asynchronously
            StringBuilder outputBuilder = new StringBuilder();
            StringBuilder errorBuilder = new StringBuilder();

            Thread outputThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        outputBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    outputBuilder.append("Error reading output stream: ").append(e.getMessage()).append("\n");
                }
            });

            Thread errorThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        errorBuilder.append(line).append("\n");
                    }
                } catch (IOException e) {
                    errorBuilder.append("Error reading error stream: ").append(e.getMessage()).append("\n");
                }
            });

            outputThread.start();
            errorThread.start();

            // Wait for process completion with timeout
            boolean finished = runProcess.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                runProcess.destroyForcibly();
                return new CodeExecutionResponse(false, "Execution timed out.", null, false, null);
            }

            // Wait for threads to finish reading
            outputThread.join(1000);
            errorThread.join(1000);

            String output = outputBuilder.toString().trim();
            String error = errorBuilder.toString().trim();

            if (runProcess.exitValue() != 0) {
                return new CodeExecutionResponse(false, "Runtime Error:\n" + error, output, false, null);
            }

            // Compare with expected output
            String expectedOutputStr;
            Object expected = request.getExpectedOutput();
            if (expected instanceof String) {
                expectedOutputStr = (String) expected;
            } else {
                expectedOutputStr = objectMapper.writeValueAsString(expected);
            }

            // Handle boolean comparison (convert to lowercase)
            if (expectedOutputStr.equalsIgnoreCase("true") || expectedOutputStr.equalsIgnoreCase("false")) {
                expectedOutputStr = expectedOutputStr.toLowerCase();
            }

            boolean passed = output.equals(expectedOutputStr);

            return new CodeExecutionResponse(true, output, null, passed, expectedOutputStr);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return new CodeExecutionResponse(false, "An internal server error occurred: " + e.getMessage(), null, false, null);
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                } catch (IOException e) {
                    System.err.println("Failed to clean up temporary directory: " + tempDir + " due to " + e.getMessage());
                }
            }
        }
    }

    private String generateMethodCall(String methodName, Object input) {
        // This method generates the appropriate method call based on input type
        // This is a simplified version - you might need to expand this based on your problem types
        return String.format(
                """
                if (isStringArray(input)) {
                    std::vector<std::string> parsedInput = parseStringArray(input);
                    auto result = solution.%s(parsedInput);
                    if (typeid(result) == typeid(std::vector<std::string>)) {
                        std::cout << "[";
                        for (size_t i = 0; i < result.size(); ++i) {
                            std::cout << "\"" << result[i] << "\"";
                            if (i < result.size() - 1) std::cout << ",";
                        }
                        std::cout << "]";
                    } else if (typeid(result) == typeid(std::vector<int>)) {
                        std::cout << "[";
                        for (size_t i = 0; i < result.size(); ++i) {
                            std::cout << result[i];
                            if (i < result.size() - 1) std::cout << ",";
                        }
                        std::cout << "]";
                    } else {
                        std::cout << result;
                    }
                } else if (isIntArray(input)) {
                    std::vector<int> parsedInput = parseIntArray(input);
                    auto result = solution.%s(parsedInput);
                    if (typeid(result) == typeid(std::vector<int>)) {
                        std::cout << "[";
                        for (size_t i = 0; i < result.size(); ++i) {
                            std::cout << result[i];
                            if (i < result.size() - 1) std::cout << ",";
                        }
                        std::cout << "]";
                    } else if (typeid(result) == typeid(std::vector<std::string>)) {
                        std::cout << "[";
                        for (size_t i = 0; i < result.size(); ++i) {
                            std::cout << "\"" << result[i] << "\"";
                            if (i < result.size() - 1) std::cout << ",";
                        }
                        std::cout << "]";
                    } else {
                        std::cout << result;
                    }
                } else {
                    // Handle as string input
                    std::string cleanInput = input;
                    if (cleanInput.front() == '\"' && cleanInput.back() == '\"') {
                        cleanInput = cleanInput.substr(1, cleanInput.length() - 2);
                    }
                    auto result = solution.%s(cleanInput);
                    std::cout << result;
                }
                """, methodName, methodName, methodName);
    }
}
