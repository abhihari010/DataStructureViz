package com.dsavisualizer.service;

import com.dsavisualizer.entity.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserProblemProgress;
import com.dsavisualizer.repository.UserProblemProgressRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProblemProgressServiceTest {
    @Mock UserProblemProgressRepository progressRepository;

    @Test
    void draftSaveIsBoundedAndDoesNotTouchLegacyTopicProgress() {
        User user = user();
        PracticeProblem problem = problem();
        when(progressRepository.findByUserIdAndProblemIdForUpdate(user.getId(), problem.getId())).thenReturn(Optional.empty());
        when(progressRepository.save(any(UserProblemProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserProblemProgressService service = new UserProblemProgressService(progressRepository);

        UserProblemProgress saved = service.saveDraft(user, problem, "  draft  ", " Python ", 12);

        assertThat(saved.getDraftCode()).isEqualTo("  draft  ");
        assertThat(saved.getDraftLanguage()).isEqualTo("python");
        assertThat(saved.getTimeSpentSeconds()).isEqualTo(12);
        assertThat(saved.getStatus()).isEqualTo(UserProblemProgress.IN_PROGRESS);
        verify(progressRepository).save(any(UserProblemProgress.class));
    }

    @Test
    void completionRequiresReceiptAndDuplicateCompletionKeepsOriginalEvidence() {
        User user = user();
        PracticeProblem problem = problem();
        ExecutionReceipt receipt = new ExecutionReceipt();
        UserProblemProgress progress = new UserProblemProgress(user, problem);
        when(progressRepository.findByUserIdAndProblemIdForUpdate(user.getId(), problem.getId()))
                .thenReturn(Optional.of(progress));
        when(progressRepository.save(any(UserProblemProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserProblemProgressService service = new UserProblemProgressService(progressRepository);

        assertThatThrownBy(() -> service.completeFromReceipt(user, problem, null, 0.2, "java", "hash"))
                .isInstanceOf(IllegalArgumentException.class);
        service.completeFromReceipt(user, problem, receipt, 0.2, "java", "first-hash");
        service.completeFromReceipt(user, problem, new ExecutionReceipt(), 0.1, "python", "second-hash");

        assertThat(progress.getCompleted()).isTrue();
        assertThat(progress.getBestRuntime()).isEqualTo(0.2);
        assertThat(progress.getBestLanguage()).isEqualTo("java");
        assertThat(progress.getBestCodeHash()).isEqualTo("first-hash");
        assertThat(progress.getLastExecutionReceipt()).isSameAs(receipt);
        verify(progressRepository, times(2)).save(progress);
    }

    @Test
    void draftLengthAndTimeBoundsAreRejected() {
        UserProblemProgressService service = new UserProblemProgressService(progressRepository);
        String oversized = "x".repeat(UserProblemProgress.MAX_DRAFT_CODE_LENGTH + 1);

        assertThatThrownBy(() -> service.saveDraft(user(), problem(), oversized, "java", 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.saveDraft(user(), problem(), "draft", "java", -1))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(progressRepository);
    }

    private User user() { return new User("service-user", "service@example.com", "hash", "Service", "User"); }
    private PracticeProblem problem() {
        PracticeProblem problem = new PracticeProblem("One", "returns one", "easy", "array");
        problem.setId(1L);
        return problem;
    }
}
