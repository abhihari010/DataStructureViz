package com.dsavisualizer.service;

import com.dsavisualizer.dto.ProgressAttemptResponse;
import com.dsavisualizer.dto.ProgressDraftRequest;
import com.dsavisualizer.dto.ProgressOutcomeRequest;
import com.dsavisualizer.dto.ProgressProblemResponse;
import com.dsavisualizer.dto.ProgressSummaryResponse;
import com.dsavisualizer.entity.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserProblemProgress;
import com.dsavisualizer.entity.UserProgress;
import com.dsavisualizer.repository.ExecutionReceiptRepository;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserProblemProgressRepository;
import com.dsavisualizer.repository.UserProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

/**
 * Facade for both the legacy topic aggregate and the authenticated problem
 * progress API. New problem state is always scoped by the authenticated user.
 */
@Service
public class UserProgressService {
    public static final int MAX_PROBLEM_RESULTS = 200;
    public static final int MAX_ATTEMPT_RESULTS = 100;

    private final UserProgressRepository userProgressRepository;
    private final UserProblemProgressRepository problemProgressRepository;
    private final ProblemAttemptService attemptService;
    private final UserProblemProgressService problemProgressService;
    private final PracticeProblemRepository problemRepository;
    private final ExecutionReceiptService receiptService;
    private final ExecutionReceiptRepository receiptRepository;

    /** Compatibility constructor for legacy callers that only use topic progress. */
    public UserProgressService(UserProgressRepository userProgressRepository) {
        this(userProgressRepository, null, null, null, null, null, null);
    }

    @Autowired
    public UserProgressService(UserProgressRepository userProgressRepository,
                               UserProblemProgressRepository problemProgressRepository,
                               ProblemAttemptService attemptService,
                               UserProblemProgressService problemProgressService,
                               PracticeProblemRepository problemRepository,
                               ExecutionReceiptService receiptService,
                               ExecutionReceiptRepository receiptRepository) {
        this.userProgressRepository = userProgressRepository;
        this.problemProgressRepository = problemProgressRepository;
        this.attemptService = attemptService;
        this.problemProgressService = problemProgressService;
        this.problemRepository = problemRepository;
        this.receiptService = receiptService;
        this.receiptRepository = receiptRepository;
    }

    public List<UserProgress> getUserProgress(String userId) {
        return userProgressRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public UserProgress updateUserProgress(User user, String topicId, Boolean completed, Integer score, Integer timeSpent) {
        Optional<UserProgress> existingProgress = userProgressRepository
                .findByUserIdAndTopicIdForUpdate(user.getId(), topicId);

        UserProgress progress;
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
            progress.setCompleted(completed);
            progress.setScore(score);
            progress.setTimeSpent(timeSpent);
            if (completed && progress.getCompletedAt() == null) {
                progress.setCompletedAt(java.time.LocalDateTime.now());
            }
        } else {
            progress = new UserProgress(user, topicId);
            progress.setCompleted(completed);
            progress.setScore(score);
            progress.setTimeSpent(timeSpent);
            if (completed) {
                progress.setCompletedAt(java.time.LocalDateTime.now());
            }
        }

        return userProgressRepository.save(progress);
    }

    public UserProgress getTopicProgress(String userId, String topicId) {
        return userProgressRepository.findByUserIdAndTopicId(userId, topicId).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ProgressProblemResponse> getProblemProgress(String userId) {
        requireProblemDependencies();
        return problemProgressService.findAll(userId).stream()
                .limit(MAX_PROBLEM_RESULTS)
                .map(progress -> toProblemResponse(progress, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProgressSummaryResponse getSummary(String userId) {
        requireProblemDependencies();
        long totalProblems = problemRepository.count();
        long trackedProblems = problemProgressRepository.countByUserId(userId);
        long completedProblems = problemProgressRepository.countByUserIdAndCompleted(userId, true);
        long inProgressProblems = problemProgressRepository.countByUserIdAndCompleted(userId, false);
        long totalAttempts = attemptService.countForUser(userId);
        long attemptedProblems = attemptService.countDistinctProblemsForUser(userId);
        return new ProgressSummaryResponse(totalProblems, trackedProblems, attemptedProblems,
                completedProblems, inProgressProblems, totalAttempts,
                getLastActivity(userId));
    }

    @Transactional(readOnly = true)
    public ProgressProblemResponse getProblemProgress(String userId, Long problemId) {
        requireProblemDependencies();
        PracticeProblem problem = findProblem(problemId);
        UserProblemProgress progress = problemProgressService.find(userId, problemId)
                .orElseGet(() -> new UserProblemProgress(null, problem));
        return toProblemResponse(progress, userId);
    }

    @Transactional
    public ProgressProblemResponse saveDraft(User user, Long problemId, ProgressDraftRequest request) {
        requireProblemDependencies();
        if (request == null) throw new IllegalArgumentException("Draft payload is required");
        PracticeProblem problem = findProblem(problemId);
        UserProblemProgress saved = problemProgressService.saveDraft(user, problem, request.draftCode(),
                request.draftLanguage(), request.timeSpentSeconds());
        return toProblemResponse(saved, user.getId());
    }

    @Transactional(readOnly = true)
    public List<ProgressAttemptResponse> getAttempts(String userId, Long problemId) {
        requireProblemDependencies();
        findProblem(problemId);
        return attemptService.findForProblem(userId, problemId).stream()
                .limit(MAX_ATTEMPT_RESULTS)
                .map(this::toAttemptResponse)
                .toList();
    }

    @Transactional
    public ProgressProblemResponse recordOutcome(User user, Long problemId, ProgressOutcomeRequest request) {
        requireProblemDependencies();
        validateOutcome(request);
        PracticeProblem problem = findProblem(problemId);
        String language = request.language().trim().toLowerCase();
        String codeHash = request.code() == null || request.code().isBlank()
                ? null : ExecutionReceiptService.sha256(request.code());
        ExecutionReceipt receipt = null;

        if (request.receiptId() != null && !request.receiptId().isBlank()) {
            if (request.code() == null || request.code().isBlank()) {
                throw new IllegalArgumentException("Code is required when recording a trusted submission");
            }
            String testSetVersion = problem.getTestSetVersion() == null ? "v1" : problem.getTestSetVersion();
            boolean consumed = receiptService.consumeReceipt(request.receiptId(), user.getId(), problemId,
                    request.code(), language, testSetVersion);
            if (!consumed) {
                throw new IllegalArgumentException("Execution receipt is invalid, expired, or already used");
            }
            receipt = receiptRepository.findByReceiptIdHashAndUserIdAndProblemId(
                    ExecutionReceiptService.sha256(request.receiptId()), user.getId(), problemId).orElse(null);
            if (receipt == null) {
                throw new IllegalArgumentException("Execution receipt is unavailable after validation");
            }
            String trustedLanguage = receipt.getLanguage() == null ? language : receipt.getLanguage();
            problemProgressService.completeFromReceipt(user, problem, receipt, receipt.getRuntime(),
                    trustedLanguage, codeHash);
        } else {
            problemProgressService.markAttempted(user, problem, request.resultStatus(), language, request.runtime());
        }

        String trustedStatus = receipt == null ? request.status() : "ACCEPTED";
        String trustedResultStatus = receipt == null ? request.resultStatus() : receipt.getResult();
        Double trustedRuntime = receipt == null ? request.runtime() : receipt.getRuntime();
        Integer trustedMemory = receipt == null ? request.memory() : receipt.getMemory();
        attemptService.recordAttempt(user, problem, trustedStatus,
                trustedResultStatus, receipt == null || receipt.getLanguage() == null
                        ? language : receipt.getLanguage(), codeHash,
                trustedRuntime, trustedMemory, receipt);
        if (receipt != null && "ACCEPTED".equalsIgnoreCase(receipt.getResult())) {
            updateUserProgress(user, problem.getTopicId(), true, null, null);
        }
        return getProblemProgress(user.getId(), problemId);
    }

    @Transactional
    public void recordTrustedSubmission(User user, PracticeProblem problem,
                                        ExecutionReceipt receipt, String code, String language) {
        requireProblemDependencies();
        if (receipt == null || code == null || language == null) {
            throw new IllegalArgumentException("Trusted submission evidence is required");
        }
        String normalizedLanguage = language.trim().toLowerCase();
        String codeHash = ExecutionReceiptService.sha256(code);
        String trustedLanguage = receipt.getLanguage() == null ? normalizedLanguage : receipt.getLanguage();
        problemProgressService.completeFromReceipt(user, problem, receipt, receipt.getRuntime(),
                trustedLanguage, codeHash);
        attemptService.recordAttempt(user, problem, "ACCEPTED", receipt.getResult(),
                normalizedLanguage, codeHash, receipt.getRuntime(), receipt.getMemory(), receipt);
        updateUserProgress(user, problem.getTopicId(), true, null, null);
    }

    private void validateOutcome(ProgressOutcomeRequest request) {
        if (request == null) throw new IllegalArgumentException("Outcome payload is required");
        if (request.status() == null || request.status().isBlank()) {
            throw new IllegalArgumentException("Outcome status is required");
        }
        if (request.language() == null || request.language().isBlank()) {
            throw new IllegalArgumentException("Outcome language is required");
        }
        if (request.code() != null && request.code().length() > UserProblemProgress.MAX_DRAFT_CODE_LENGTH) {
            throw new IllegalArgumentException("Outcome code exceeds the maximum allowed length");
        }
        if (request.receiptId() != null && request.receiptId().length() > 256) {
            throw new IllegalArgumentException("Execution receipt is too long");
        }
    }

    private ProgressProblemResponse toProblemResponse(UserProblemProgress progress, String userId) {
        PracticeProblem problem = progress.getProblem();
        List<com.dsavisualizer.entity.ProblemAttempt> attempts = attemptService.findForProblem(userId, problem.getId());
        com.dsavisualizer.entity.ProblemAttempt latest = attempts.isEmpty() ? null : attempts.get(0);
        return new ProgressProblemResponse(problem.getId(), problem.getTitle(), problem.getDifficulty(), problem.getTopicId(),
                progress.getStatus(), Boolean.TRUE.equals(progress.getCompleted()), progress.getDraftCode(),
                progress.getDraftLanguage(), progress.getTimeSpentSeconds(), progress.getBestRuntime(),
                progress.getBestResultStatus(), progress.getBestLanguage(), attempts.size(),
                latest == null ? null : latest.getAttemptedAt(), progress.getCompletedAt(), progress.getUpdatedAt());
    }

    private ProgressAttemptResponse toAttemptResponse(com.dsavisualizer.entity.ProblemAttempt attempt) {
        return new ProgressAttemptResponse(attempt.getId(), attempt.getProblem().getId(), attempt.getStatus(),
                attempt.getResultStatus(), attempt.getLanguage(), attempt.getRuntime(), attempt.getMemory(),
                attempt.getAttemptedAt());
    }

    private PracticeProblem findProblem(Long problemId) {
        if (problemId == null) throw new IllegalArgumentException("Problem id is required");
        return problemRepository.findById(problemId)
                .orElseThrow(() -> new NoSuchElementException("Problem not found"));
    }

    private java.time.Instant getLastActivity(String userId) {
        List<UserProblemProgress> progress = problemProgressService.findAll(userId);
        java.time.Instant latestProgress = progress.stream()
                .map(UserProblemProgress::getUpdatedAt)
                .filter(java.util.Objects::nonNull)
                .max(java.time.Instant::compareTo)
                .orElse(null);
        return latestProgress;
    }

    private void requireProblemDependencies() {
        if (problemProgressRepository == null || attemptService == null || problemProgressService == null
                || problemRepository == null || receiptService == null || receiptRepository == null) {
            throw new IllegalStateException("Problem progress dependencies are not configured");
        }
    }
}
