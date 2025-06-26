package com.dsavisualizer.dto;

public record TestCaseResult(
        int caseNumber,
        String stdin,
        String stdout,
        String stderr,
        boolean passed
) {
}
