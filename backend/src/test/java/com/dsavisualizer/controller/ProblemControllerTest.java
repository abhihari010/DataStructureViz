package com.dsavisualizer.controller;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProblemControllerTest {
    @Test
    void publicProblemResponseContainsExamplesButNoReferenceOrEvaluationData() throws Exception {
        PracticeProblem problem = new PracticeProblem("Two Sum", "Find a pair", "easy", "array");
        problem.setId(1L);
        problem.setTestCases(List.of(Map.of("input", List.of(1, 2), "output", List.of(0, 1))));
        problem.setSolutions(Map.of("python", Map.of("code", "return [0, 1]")));
        problem.setSolution("secret");
        problem.setExamples(List.of(Map.of("input", "[1, 2]", "output", "[0, 1]")));

        PracticeProblemRepository repository = mock(PracticeProblemRepository.class);
        when(repository.findById(1L)).thenReturn(java.util.Optional.of(problem));
        var response = new ProblemController(repository).getProblem(1L);

        String json = new ObjectMapper().writeValueAsString(response.getBody());
        assertThat(json).contains("Two Sum", "examples", "[1, 2]");
        assertThat(json).doesNotContain("solutions", "solution", "testCases", "return [0, 1]");
    }
}
