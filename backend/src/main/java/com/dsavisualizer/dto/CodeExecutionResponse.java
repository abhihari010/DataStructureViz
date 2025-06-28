package com.dsavisualizer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionResponse {
    // Getters and Setters
    private boolean success;
    private List<TestCaseResult> testCaseResults;
    private boolean passed;
    private Object expectedOutput;
    private Double runtime; // in seconds
    private Integer memory; // in KB


}
