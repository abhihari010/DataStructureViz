package com.dsavisualizer.service;

import com.dsavisualizer.entity.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.ProblemAttempt;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.ProblemAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProblemAttemptService {
    public static final int MAX_LANGUAGE_LENGTH = 32;
    public static final int MAX_STATUS_LENGTH = 32;
    public static final int MAX_CODE_HASH_LENGTH = 64;
    public static final int MAX_MEMORY = 1_000_000;
    public static final double MAX_RUNTIME = 86_400;

    private final ProblemAttemptRepository attemptRepository;

    public ProblemAttemptService(ProblemAttemptRepository attemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    @Transactional
    public ProblemAttempt recordAttempt(User user, PracticeProblem problem, String status,
                                        String resultStatus, String language, String codeHash,
                                        Double runtime, Integer memory, ExecutionReceipt receipt) {
        if (status == null || status.isBlank()) throw new IllegalArgumentException("Attempt status is required");
        if (language == null || language.isBlank()) throw new IllegalArgumentException("Attempt language is required");
        if (status.trim().length() > MAX_STATUS_LENGTH || language.trim().length() > MAX_LANGUAGE_LENGTH) {
            throw new IllegalArgumentException("Attempt status or language is too long");
        }
        if (resultStatus != null && resultStatus.trim().length() > MAX_STATUS_LENGTH) {
            throw new IllegalArgumentException("Attempt result status is too long");
        }
        if (codeHash != null && codeHash.length() > MAX_CODE_HASH_LENGTH) {
            throw new IllegalArgumentException("Attempt code hash is too long");
        }
        if (runtime != null && (runtime < 0 || runtime > MAX_RUNTIME || !Double.isFinite(runtime))) {
            throw new IllegalArgumentException("Attempt runtime is outside the allowed range");
        }
        if (memory != null && (memory < 0 || memory > MAX_MEMORY)) {
            throw new IllegalArgumentException("Attempt memory is outside the allowed range");
        }

        ProblemAttempt attempt = new ProblemAttempt(user, problem, status.trim().toUpperCase(),
                language.trim().toLowerCase());
        attempt.setResultStatus(resultStatus == null ? null : resultStatus.trim().toUpperCase());
        attempt.setCodeHash(codeHash);
        attempt.setRuntime(runtime);
        attempt.setMemory(memory);
        attempt.setExecutionReceipt(receipt);
        return attemptRepository.save(attempt);
    }

    /** Compatibility overload retained for the U5 service tests and callers that do not retain a code hash. */
    @Transactional
    public ProblemAttempt recordAttempt(User user, PracticeProblem problem, String status,
                                        String resultStatus, String language, Double runtime,
                                        Integer memory, ExecutionReceipt receipt) {
        return recordAttempt(user, problem, status, resultStatus, language, null, runtime, memory, receipt);
    }

    @Transactional(readOnly = true)
    public List<ProblemAttempt> findForProblem(String userId, Long problemId) {
        return attemptRepository.findByUserIdAndProblemIdOrderByCreatedAtDesc(userId, problemId);
    }

    @Transactional(readOnly = true)
    public List<ProblemAttempt> findForUser(String userId) {
        return attemptRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countForUser(String userId) {
        return attemptRepository.countByUserId(userId);
    }

    public long countDistinctProblemsForUser(String userId) {
        return attemptRepository.countDistinctProblemsByUserId(userId);
    }
}
