package com.dsavisualizer.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.dsavisualizer.dto.CodeExecutionRequest;
import com.dsavisualizer.dto.CodeExecutionResponse;
import com.dsavisualizer.dto.ExecutionStatus;
import com.dsavisualizer.dto.Judge0Result;
import com.dsavisualizer.dto.MethodSignature;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import reactor.core.publisher.Mono;

class CodeExecutionServiceTest {
    @Mock private Judge0Service judge0Service;
    @Mock private PracticeProblemRepository problemRepository;
    @Mock private CodeWrapperService codeWrapperService;

    private CodeExecutionService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new CodeExecutionService(judge0Service, problemRepository, new ObjectMapper(), codeWrapperService);
    }

    @Test
    void acceptedExecutionReturnsReceiptAndStableContractFields() throws Exception {
        PracticeProblem problem = problem();
        when(problemRepository.findById(1L)).thenReturn(Optional.of(problem));
        when(judge0Service.getLanguageId("python")).thenReturn(71);
        when(codeWrapperService.wrapCode(any(), any(), any(), eq("python"))).thenReturn("wrapped");
        when(judge0Service.submitAndWait(any())).thenReturn(Mono.just(
                new Judge0Result(new com.dsavisualizer.dto.Status(3, "Accepted"), "1\n", null, null, null, 0.01, 128L)));

        CodeExecutionRequest request = request("return 1");
        CodeExecutionResponse response = service.executeCode(request, "learner@example.com");

        assertThat(response.getContractVersion()).isEqualTo("v1");
        assertThat(response.getStatus()).isEqualTo(ExecutionStatus.ACCEPTED);
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.isPassed()).isTrue();
        assertThat(response.getReceipt()).isNotNull();
        assertThat(response.getReceipt().problemId()).isEqualTo(1L);
        assertThat(response.getReceipt().codeHash()).hasSize(64);
        assertThat(response.getReceipt().receiptId()).isNotBlank();
    }

    @Test
    void oversizedCodeIsRejectedBeforeJudge0() {
        CodeExecutionRequest request = request("x".repeat(100_001));

        CodeExecutionResponse response = service.executeCode(request);

        assertThat(response.getStatus()).isEqualTo(ExecutionStatus.VALIDATION_ERROR);
        verifyNoInteractions(problemRepository, judge0Service, codeWrapperService);
    }

    @Test
    void providerFailureIsTypedAndDoesNotReturnProviderDetails() throws Exception {
        when(problemRepository.findById(1L)).thenReturn(Optional.of(problem()));
        when(judge0Service.getLanguageId("python")).thenReturn(71);
        when(codeWrapperService.wrapCode(any(), any(), any(), eq("python"))).thenReturn("wrapped");
        when(judge0Service.submitAndWait(any())).thenReturn(Mono.error(
                new Judge0ProviderException(com.dsavisualizer.dto.Judge0FailureType.QUOTA)));

        CodeExecutionResponse response = service.executeCode(request("return 1"));

        assertThat(response.getStatus()).isEqualTo(ExecutionStatus.PROVIDER_QUOTA);
        assertThat(response.getError()).doesNotContain("QUOTA").doesNotContain("rapidapi");
    }

    private CodeExecutionRequest request(String code) {
        return new CodeExecutionRequest(code, "python", 1L, null, null);
    }

    private PracticeProblem problem() {
        PracticeProblem problem = new PracticeProblem("One", "returns one", "easy", "arrays");
        problem.setId(1L);
        problem.setMethodName("solve");
        problem.setMethodSignature(new MethodSignature(List.of(), "int", null));
        problem.setTestCases(List.of(Map.of("input", "", "output", "1")));
        return problem;
    }
}
