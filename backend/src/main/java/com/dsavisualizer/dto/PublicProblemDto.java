package com.dsavisualizer.dto;

import com.dsavisualizer.entity.PracticeProblem;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public record PublicProblemDto(
        Long id,
        String title,
        String description,
        String difficulty,
        @JsonProperty("topicId") String topicId,
        List<PublicExampleDto> examples,
        @JsonProperty("boilerPlateCode") String boilerPlateCode,
        @JsonProperty("methodName") String methodName,
        @JsonProperty("methodSignature") MethodSignature methodSignature,
        @JsonProperty("createdAt") LocalDateTime createdAt
) {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static PublicProblemDto from(PracticeProblem problem) {
        List<Map<String, Object>> sourceExamples = problem.getExamples();
        if (sourceExamples == null || sourceExamples.isEmpty()) {
            sourceExamples = Collections.emptyList();
        }
        List<PublicExampleDto> examples = sourceExamples.stream().map(PublicProblemDto::example).toList();
        return new PublicProblemDto(problem.getId(), problem.getTitle(), problem.getDescription(),
                problem.getDifficulty(), problem.getTopicId(), examples, problem.getBoilerPlateCode(),
                problem.getMethodName(), problem.getMethodSignature(), problem.getCreatedAt());
    }

    private static PublicExampleDto example(Map<String, Object> example) {
        Object input = example.containsKey("input") ? example.get("input") : example.get("inputArgs");
        Object output = example.get("output");
        if (output instanceof Map<?, ?> outputByLanguage) {
            output = outputByLanguage.values().stream().findFirst().orElse(null);
        }
        return new PublicExampleDto(display(input), display(output),
                example.get("explanation") == null ? null : String.valueOf(example.get("explanation")));
    }

    private static String display(Object value) {
        if (value == null) return "";
        if (value instanceof String string) return string;
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (Exception ignored) {
            return String.valueOf(value);
        }
    }
}
