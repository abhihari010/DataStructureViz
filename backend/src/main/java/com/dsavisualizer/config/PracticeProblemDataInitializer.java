package com.dsavisualizer.config;

import com.dsavisualizer.dto.MethodSignature;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

@Component
public class PracticeProblemDataInitializer {
    private final PracticeProblemRepository practiceProblemRepository;
    private final ObjectMapper objectMapper;

    public PracticeProblemDataInitializer(PracticeProblemRepository practiceProblemRepository, ObjectMapper objectMapper) {
        this.practiceProblemRepository = practiceProblemRepository;
        this.objectMapper = objectMapper;
    }

    public void initializeProblems() throws Exception {
        if (practiceProblemRepository.count() == 0) {
            String[] files = new String[] {
                "problems/stack-problems.json",
                "problems/queue-problems.json",
                "problems/binary-tree-problems.json",
                "problems/linked-list-problems.json",
                "problems/array-problems.json",
                "problems/graph-problems.json"
            };
            for (String file : files) {
                InputStream is = new ClassPathResource(file).getInputStream();
                List<Map<String, Object>> problems = objectMapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
                for (Map<String, Object> p : problems) {
                    PracticeProblem problem = new PracticeProblem(
                        (String)p.get("title"),
                        (String)p.get("description"),
                        (String)p.get("difficulty"),
                        (String)p.get("topic")
                    );
                    problem.setMethodName((String)p.get("methodName"));
                    problem.setTestCases((List<Map<String, Object>>)p.get("testCases"));

                    // Handle method signature
                    Object methodSigObj = p.get("methodSignature");
                    if (methodSigObj instanceof Map) {
                        MethodSignature methodSignature = objectMapper.convertValue(methodSigObj, MethodSignature.class);
                        problem.setMethodSignature(methodSignature);
                    }

                    // Handle solutions: Map<String, Map<String, String>> or Map<String, String>
                    Object solObj = p.get("solutions");
                    if (solObj instanceof Map) {
                        Map<String, ?> solMap = (Map<String, ?>) solObj;
                        boolean isOldFormat = solMap.values().stream().allMatch(v -> v instanceof String);
                        if (isOldFormat) {
                            Map<String, Map<String, String>> newSol = new HashMap<>();
                            for (Map.Entry<String, ?> entry : solMap.entrySet()) {
                                newSol.put(entry.getKey(), Collections.singletonMap("code", (String)entry.getValue()));
                            }
                            problem.setSolutions(newSol);
                        } else {
                            problem.setSolutions((Map<String, Map<String, String>>) solObj);
                        }
                    }

                    // Handle timeComplexity
                    Object tcObj = p.get("timeComplexity");
                    if (tcObj instanceof String) {
                        problem.setTimeComplexity(Collections.singletonMap("default", (String)tcObj));
                    } else if (tcObj instanceof Map) {
                        problem.setTimeComplexity((Map<String, String>) tcObj);
                    }

                    // Handle spaceComplexity
                    Object scObj = p.get("spaceComplexity");
                    if (scObj instanceof String) {
                        problem.setSpaceComplexity(Collections.singletonMap("default", (String)scObj));
                    } else if (scObj instanceof Map) {
                        problem.setSpaceComplexity((Map<String, String>) scObj);
                    }

                    problem.setBoilerPlateCode(objectMapper.writeValueAsString(p.get("boilerPlateCode")));
                    practiceProblemRepository.save(problem);
                }
            }
        }
    }
} 