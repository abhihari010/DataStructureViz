package com.dsavisualizer.service;

import com.dsavisualizer.dto.Judge0FailureType;

public class Judge0ProviderException extends RuntimeException {
    private final Judge0FailureType failureType;

    public Judge0ProviderException(Judge0FailureType failureType) {
        super(failureType.name());
        this.failureType = failureType;
    }

    public Judge0FailureType getFailureType() {
        return failureType;
    }
}
