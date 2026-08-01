package com.dsavisualizer.service;

import com.dsavisualizer.dto.ProgressOutcomeRequest;
import com.dsavisualizer.entity.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserProblemProgress;
import com.dsavisualizer.repository.ExecutionReceiptRepository;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserProblemProgressRepository;
import com.dsavisualizer.repository.UserProgressRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserProgressServiceTest {
    private final UserProgressRepository legacyRepository = mock(UserProgressRepository.class);
    private final UserProblemProgressRepository progressRepository = mock(UserProblemProgressRepository.class);
    private final ProblemAttemptService attemptService = mock(ProblemAttemptService.class);
    private final UserProblemProgressService problemProgressService = mock(UserProblemProgressService.class);
    private final PracticeProblemRepository problemRepository = mock(PracticeProblemRepository.class);
    private final ExecutionReceiptService receiptService = mock(ExecutionReceiptService.class);
    private final ExecutionReceiptRepository receiptRepository = mock(ExecutionReceiptRepository.class);
    private final UserProgressService service = new UserProgressService(legacyRepository, progressRepository,
            attemptService, problemProgressService, problemRepository, receiptService, receiptRepository);

    @Test
    void forgedOutcomeCannotCompleteProgressWithoutAConsumedReceipt() {
        User user = user();
        PracticeProblem problem = problem();
        when(problemRepository.findById(1L)).thenReturn(Optional.of(problem));
        when(receiptService.consumeReceipt(anyString(), anyString(), anyLong(), anyString(), anyString(), anyString()))
                .thenReturn(false);

        assertThatThrownBy(() -> service.recordOutcome(user, 1L,
                new ProgressOutcomeRequest("SUBMITTED", "ACCEPTED", "python", "return 1", "forged", 0.1, 12)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Execution receipt");
        verifyNoInteractions(problemProgressService, attemptService);
    }

    @Test
    void validReceiptIsBoundToOwnerAndProblemBeforeCompletion() {
        User user = user();
        PracticeProblem problem = problem();
        ExecutionReceipt receipt = new ExecutionReceipt();
        UserProblemProgress progress = new UserProblemProgress(user, problem);
        when(problemRepository.findById(1L)).thenReturn(Optional.of(problem));
        when(receiptService.consumeReceipt("opaque", "owner", 1L, "return 1", "python", "v1"))
                .thenReturn(true);
        when(receiptRepository.findByReceiptIdHashAndUserIdAndProblemId(
                ExecutionReceiptService.sha256("opaque"), "owner", 1L)).thenReturn(Optional.of(receipt));
        when(problemProgressService.find("owner", 1L)).thenReturn(Optional.of(progress));
        when(attemptService.findForProblem("owner", 1L)).thenReturn(java.util.List.of());

        service.recordOutcome(user, 1L,
                new ProgressOutcomeRequest("SUBMITTED", "ACCEPTED", "python", "return 1", "opaque", 0.1, 12));

        verify(receiptService).consumeReceipt("opaque", "owner", 1L, "return 1", "python", "v1");
        verify(problemProgressService).completeFromReceipt(eq(user), eq(problem), eq(receipt), isNull(),
                eq("python"), eq(ExecutionReceiptService.sha256("return 1")));
        verify(attemptService).recordAttempt(eq(user), eq(problem), eq("ACCEPTED"), isNull(),
                eq("python"), eq(ExecutionReceiptService.sha256("return 1")), isNull(), isNull(), eq(receipt));
    }

    @Test
    void outcomeCodeAndReceiptInputsAreBounded() {
        assertThatThrownBy(() -> service.recordOutcome(user(), 1L,
                new ProgressOutcomeRequest("EXECUTED", "FAILED", "python",
                        "x".repeat(100_001), null, 0.1, 1)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("code");
        verifyNoInteractions(problemRepository, receiptService, attemptService);
    }

    private User user() { return new User("owner", "owner@example.com", "hash", "Owner", "User"); }

    private PracticeProblem problem() {
        PracticeProblem problem = new PracticeProblem("One", "returns one", "easy", "array");
        problem.setId(1L);
        problem.setTestSetVersion("v1");
        return problem;
    }
}
