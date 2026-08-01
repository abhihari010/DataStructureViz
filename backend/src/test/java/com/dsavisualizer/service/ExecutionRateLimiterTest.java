package com.dsavisualizer.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import org.junit.jupiter.api.Test;

class ExecutionRateLimiterTest {
    @Test
    void limitsBothAuthenticatedSubjectAndIpWithinWindow() {
        ExecutionRateLimiter limiter = new ExecutionRateLimiter(2, Duration.ofMinutes(1));

        assertThat(limiter.tryAcquire("learner", "10.0.0.1")).isTrue();
        assertThat(limiter.tryAcquire("learner", "10.0.0.1")).isTrue();
        assertThat(limiter.tryAcquire("learner", "10.0.0.1")).isFalse();
        assertThat(limiter.tryAcquire("other", "10.0.0.1")).isFalse();
        assertThat(limiter.tryAcquire("learner", "10.0.0.2")).isFalse();
    }
}
