package com.dsavisualizer.dto;

import java.time.Instant;

public record ProgressSummaryResponse(
        long totalProblems,
        long trackedProblems,
        long attemptedProblems,
        long completedProblems,
        long inProgressProblems,
        long totalAttempts,
        Instant lastActivityAt
) {
}
