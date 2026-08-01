package com.dsavisualizer.dto;

import java.time.Instant;

public record ProgressProblemResponse(
        Long problemId,
        String title,
        String difficulty,
        String topicId,
        String status,
        boolean completed,
        String draftCode,
        String draftLanguage,
        Integer timeSpentSeconds,
        Double bestRuntime,
        String bestResultStatus,
        String bestLanguage,
        long attemptCount,
        Instant lastAttemptAt,
        Instant completedAt,
        Instant updatedAt
) {
}
