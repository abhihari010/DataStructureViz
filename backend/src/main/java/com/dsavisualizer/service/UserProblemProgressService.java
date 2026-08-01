package com.dsavisualizer.service;

import com.dsavisualizer.entity.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserProblemProgress;
import com.dsavisualizer.repository.UserProblemProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserProblemProgressService {
    public static final int MAX_TIME_SPENT_SECONDS = 604_800;
    public static final int MAX_LANGUAGE_LENGTH = 32;

    private final UserProblemProgressRepository progressRepository;

    public UserProblemProgressService(UserProblemProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @Transactional(readOnly = true)
    public Optional<UserProblemProgress> find(String userId, Long problemId) {
        return progressRepository.findByUserIdAndProblemId(userId, problemId);
    }

    @Transactional(readOnly = true)
    public List<UserProblemProgress> findAll(String userId) {
        return progressRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional
    public UserProblemProgress getOrCreate(User user, PracticeProblem problem) {
        return progressRepository.findByUserIdAndProblemIdForUpdate(user.getId(), problem.getId())
                .orElseGet(() -> progressRepository.save(new UserProblemProgress(user, problem)));
    }

    @Transactional
    public UserProblemProgress saveDraft(User user, PracticeProblem problem, String draftCode,
                                         String draftLanguage, Integer timeSpentSeconds) {
        if (draftCode != null && draftCode.length() > UserProblemProgress.MAX_DRAFT_CODE_LENGTH) {
            throw new IllegalArgumentException("Draft code exceeds the maximum allowed length");
        }
        if (timeSpentSeconds != null && (timeSpentSeconds < 0 || timeSpentSeconds > MAX_TIME_SPENT_SECONDS)) {
            throw new IllegalArgumentException("Time spent is outside the allowed range");
        }
        validateLanguage(draftLanguage);

        UserProblemProgress progress = progressRepository.findByUserIdAndProblemIdForUpdate(user.getId(), problem.getId())
                .orElseGet(() -> new UserProblemProgress(user, problem));
        progress.setDraftCode(draftCode);
        progress.setDraftLanguage(normalizeLanguage(draftLanguage));
        if (timeSpentSeconds != null) progress.setTimeSpentSeconds(timeSpentSeconds);
        if (!Boolean.TRUE.equals(progress.getCompleted())) {
            progress.setStatus(UserProblemProgress.IN_PROGRESS);
        }
        return progressRepository.save(progress);
    }

    @Transactional
    public UserProblemProgress markAttempted(User user, PracticeProblem problem, String resultStatus,
                                             String language, Double runtime) {
        validateLanguage(language);
        validateRuntime(runtime);

        UserProblemProgress progress = getOrCreate(user, problem);
        if (!Boolean.TRUE.equals(progress.getCompleted())) {
            progress.setStatus(UserProblemProgress.IN_PROGRESS);
        }
        if (shouldReplaceBest(progress, runtime)) {
            progress.setBestRuntime(runtime);
            progress.setBestResultStatus(normalizeStatus(resultStatus));
            progress.setBestLanguage(normalizeLanguage(language));
        }
        return progressRepository.save(progress);
    }

    /**
     * Records completion only from a receipt already validated by U3. This
     * service never derives completion from legacy topic progress or a client
     * boolean. Repeated calls keep the first completion evidence intact.
     */
    @Transactional
    public UserProblemProgress completeFromReceipt(User user, PracticeProblem problem,
                                                   ExecutionReceipt receipt, Double runtime,
                                                   String language, String codeHash) {
        if (receipt == null) throw new IllegalArgumentException("A trusted execution receipt is required");
        validateLanguage(language);
        validateRuntime(runtime);
        UserProblemProgress progress = getOrCreate(user, problem);
        if (!Boolean.TRUE.equals(progress.getCompleted())) {
            progress.setCompleted(true);
            progress.setStatus(UserProblemProgress.COMPLETED);
            progress.setCompletedAt(Instant.now());
            progress.setLastExecutionReceipt(receipt);
            progress.setBestRuntime(runtime);
            progress.setBestLanguage(normalizeLanguage(language));
            progress.setBestCodeHash(codeHash);
            progress.setBestResultStatus("ACCEPTED");
        }
        return progressRepository.save(progress);
    }

    private String normalizeLanguage(String language) {
        return language == null ? null : language.trim().toLowerCase();
    }

    private String normalizeStatus(String status) {
        return status == null ? null : status.trim().toUpperCase();
    }

    private boolean shouldReplaceBest(UserProblemProgress progress, Double runtime) {
        return progress.getBestRuntime() == null
                || (runtime != null && runtime < progress.getBestRuntime());
    }

    private void validateLanguage(String language) {
        if (language != null && language.trim().length() > MAX_LANGUAGE_LENGTH) {
            throw new IllegalArgumentException("Language exceeds the maximum allowed length");
        }
    }

    private void validateRuntime(Double runtime) {
        if (runtime != null && (runtime < 0 || runtime > 86_400 || !Double.isFinite(runtime))) {
            throw new IllegalArgumentException("Runtime is outside the allowed range");
        }
    }
}
