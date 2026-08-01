package com.dsavisualizer.service;

import com.dsavisualizer.entity.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.ProblemAttempt;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.ProblemAttemptRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProblemAttemptServiceTest {
    @Mock ProblemAttemptRepository attemptRepository;

    @Test
    void recordAttemptCreatesASeparateEvidenceRowAndNormalizesBoundFields() {
        when(attemptRepository.save(any(ProblemAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ProblemAttemptService service = new ProblemAttemptService(attemptRepository);
        ExecutionReceipt receipt = new ExecutionReceipt();

        ProblemAttempt attempt = service.recordAttempt(user(), problem(), " accepted ", " accepted ",
                " Python ", "code-hash", 0.4, 128, receipt);

        assertThat(attempt.getStatus()).isEqualTo("ACCEPTED");
        assertThat(attempt.getResultStatus()).isEqualTo("ACCEPTED");
        assertThat(attempt.getLanguage()).isEqualTo("python");
        assertThat(attempt.getExecutionReceipt()).isSameAs(receipt);
        verify(attemptRepository).save(attempt);
    }

    @Test
    void recordAttemptRequiresStatusAndLanguage() {
        ProblemAttemptService service = new ProblemAttemptService(attemptRepository);

        assertThatThrownBy(() -> service.recordAttempt(user(), problem(), "", "FAILED", "java", null, null, null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.recordAttempt(user(), problem(), "FAILED", "FAILED", " ", null, null, null))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(attemptRepository);
    }

    private User user() { return new User("attempt-user", "attempt@example.com", "hash", "Attempt", "User"); }
    private PracticeProblem problem() {
        PracticeProblem problem = new PracticeProblem("One", "returns one", "easy", "array");
        problem.setId(1L);
        return problem;
    }
}
