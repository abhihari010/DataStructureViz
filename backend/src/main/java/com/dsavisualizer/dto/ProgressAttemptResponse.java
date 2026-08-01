package com.dsavisualizer.dto;

import java.time.Instant;

public record ProgressAttemptResponse(
        Long id,
        Long problemId,
        String status,
        String resultStatus,
        String language,
        Double runtime,
        Integer memory,
        Instant attemptedAt
) {
}
