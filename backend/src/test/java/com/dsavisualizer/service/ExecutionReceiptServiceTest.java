package com.dsavisualizer.service;

import com.dsavisualizer.dto.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.ExecutionReceiptRepository;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ExecutionReceiptServiceTest {
    @Test
    void consumeBindsReceiptToUserProblemCodeLanguageAndTestSetVersion() {
        ExecutionReceiptRepository receipts = mock(ExecutionReceiptRepository.class);
        PracticeProblemRepository problems = mock(PracticeProblemRepository.class);
        UserRepository users = mock(UserRepository.class);
        ExecutionReceiptService service = new ExecutionReceiptService(receipts, problems, users);
        when(receipts.consumeIfValid(any(), eq("user-1"), eq(1L), any(), eq("python"), eq("v1"), any()))
                .thenReturn(1);

        boolean consumed = service.consumeReceipt("opaque", "user-1", 1L, "return 1", "python", "v1");

        assertThat(consumed).isTrue();
        verify(receipts).consumeIfValid(
                eq(ExecutionReceiptService.sha256("opaque")), eq("user-1"), eq(1L),
                eq(ExecutionReceiptService.sha256("return 1")), eq("python"), eq("v1"), any());
    }

    @Test
    void successfulExecutionReceiptIsStoredHashedAndBoundToAuthenticatedUser() {
        ExecutionReceiptRepository receipts = mock(ExecutionReceiptRepository.class);
        PracticeProblemRepository problems = mock(PracticeProblemRepository.class);
        UserRepository users = mock(UserRepository.class);
        ExecutionReceiptService service = new ExecutionReceiptService(receipts, problems, users);
        PracticeProblem problem = new PracticeProblem("One", "returns one", "easy", "array");
        problem.setId(1L);
        problem.setTestSetVersion("v1");
        when(problems.findById(1L)).thenReturn(Optional.of(problem));
        when(users.getReferenceById("user-1")).thenReturn(new com.dsavisualizer.entity.User("user-1", "u@example.com", "x", "U", "One"));

        service.store(new ExecutionReceipt("opaque", 1L, "python", ExecutionReceiptService.sha256("return 1"),
                true, Instant.now(), Instant.now().plusSeconds(600)), "user-1");

        var captor = ArgumentCaptor.forClass(com.dsavisualizer.entity.ExecutionReceipt.class);
        verify(receipts).save(captor.capture());
        assertThat(captor.getValue().getReceiptIdHash()).isEqualTo(ExecutionReceiptService.sha256("opaque"));
        assertThat(captor.getValue().getCodeHash()).isEqualTo(ExecutionReceiptService.sha256("return 1"));
        assertThat(captor.getValue().getTestSetVersion()).isEqualTo("v1");
        assertThat(captor.getValue().getUser().getId()).isEqualTo("user-1");
    }

    @Test
    void receiptJsonExposesOnlyOpaqueId() throws Exception {
        String json = new ObjectMapper().writeValueAsString(new ExecutionReceipt(
                "opaque", 1L, "python", "code-hash", true, Instant.now(), Instant.now().plusSeconds(600)));

        assertThat(json).contains("receipt_id").contains("opaque");
        assertThat(json).doesNotContain("problem_id", "code_hash", "issued_at", "expires_at", "python");
    }
}
