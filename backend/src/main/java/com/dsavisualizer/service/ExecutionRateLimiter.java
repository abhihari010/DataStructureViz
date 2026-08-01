package com.dsavisualizer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Small in-process guardrail; a shared store can replace it without changing the controller contract. */
@Component
public class ExecutionRateLimiter {
    private static final int MAX_TRACKED_BUCKETS = 10_000;
    private final int maxRequests;
    private final long windowMillis;
    private final Map<String, Deque<Long>> requests = new ConcurrentHashMap<>();

    @Autowired
    public ExecutionRateLimiter(
            @Value("${execution.rate-limit.max:5}") int maxRequests,
            @Value("${execution.rate-limit.window:1m}") Duration window) {
        this(maxRequests, window, true);
    }

    private ExecutionRateLimiter(int maxRequests, Duration window, boolean ignored) {
        if (maxRequests < 1 || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("Execution rate limit must be positive");
        }
        this.maxRequests = maxRequests;
        this.windowMillis = window.toMillis();
        if (this.windowMillis < 1) {
            throw new IllegalArgumentException("Execution rate limit window must be at least 1 millisecond");
        }
    }

    public synchronized boolean tryAcquire(String userKey, String ipAddress) {
        long now = System.currentTimeMillis();
        String userBucket = "user:" + userKey;
        String ipBucket = "ip:" + ipAddress;
        cleanup(now);
        int newBuckets = (requests.containsKey(userBucket) ? 0 : 1)
                + (requests.containsKey(ipBucket) ? 0 : 1);
        if (requests.size() + newBuckets > MAX_TRACKED_BUCKETS) {
            return false;
        }
        if (!canAcquire(userBucket, now) || !canAcquire(ipBucket, now)) {
            return false;
        }
        record(userBucket, now);
        record(ipBucket, now);
        return true;
    }

    private boolean canAcquire(String key, long now) {
        Deque<Long> bucket = requests.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        prune(bucket, now);
        return bucket.size() < maxRequests;
    }

    private void record(String key, long now) {
        requests.computeIfAbsent(key, ignored -> new ArrayDeque<>()).addLast(now);
    }

    private void prune(Deque<Long> bucket, long now) {
        while (!bucket.isEmpty() && now - bucket.peekFirst() >= windowMillis) {
            bucket.removeFirst();
        }
    }

    private void cleanup(long now) {
        requests.entrySet().removeIf(entry -> {
            prune(entry.getValue(), now);
            return entry.getValue().isEmpty();
        });
    }
}
