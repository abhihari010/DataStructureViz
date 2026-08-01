package com.dsavisualizer.controller;

import com.dsavisualizer.dto.SubmitSolutionRequest;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserSolution;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserSolutionRepository;
import com.dsavisualizer.service.ExecutionReceiptService;
import com.dsavisualizer.service.UserProgressService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SolutionControllerTest {
    @Test
    void validReceiptMarksSolutionPassedAndUpdatesProgress() {
        User user = new User("user-1", "u@example.com", "x", "U", "One");
        PracticeProblem problem = new PracticeProblem("One", "returns one", "easy", "array");
        problem.setId(1L);
        problem.setTestSetVersion("v1");
        when(problemRepository.findById(1L)).thenReturn(Optional.of(problem));
        when(receipts.consumeReceipt("opaque", "user-1", 1L, "return 1", "python", "v1")).thenReturn(true);
        var trustedReceipt = new com.dsavisualizer.entity.ExecutionReceipt();
        trustedReceipt.setLanguage("python");
        trustedReceipt.setResult("ACCEPTED");
        when(receipts.findReceipt("opaque", "user-1", 1L)).thenReturn(trustedReceipt);
        when(solutions.save(any(UserSolution.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller().saveSolution(
                new SubmitSolutionRequest(1L, "return 1", "python", "opaque", 0.1, 64), authentication(user));

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("passed", true);
        verify(progress).recordTrustedSubmission(user, problem, trustedReceipt, "return 1", "python");
    }

    @Test
    void replayedOrMismatchedReceiptCannotCreateCompletion() {
        User user = new User("user-1", "u@example.com", "x", "U", "One");
        when(problemRepository.findById(1L)).thenReturn(Optional.of(problem(1L)));
        when(receipts.consumeReceipt(any(), any(), anyLong(), any(), any(), any())).thenReturn(false);

        var response = controller().saveSolution(
                new SubmitSolutionRequest(1L, "return 1", "python", "replayed", null, null), authentication(user));

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        verifyNoInteractions(solutions, progress);
    }

    private final UserSolutionRepository solutions = mock(UserSolutionRepository.class);
    private final PracticeProblemRepository problemRepository = mock(PracticeProblemRepository.class);
    private final ExecutionReceiptService receipts = mock(ExecutionReceiptService.class);
    private final UserProgressService progress = mock(UserProgressService.class);

    private SolutionController controller() {
        return new SolutionController(solutions, problemRepository, progress, receipts);
    }

    private Authentication authentication(User user) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);
        return authentication;
    }

    private PracticeProblem problem(Long id) {
        PracticeProblem problem = new PracticeProblem("One", "returns one", "easy", "array");
        problem.setId(id);
        problem.setTestSetVersion("v1");
        return problem;
    }
}
