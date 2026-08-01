package com.dsavisualizer.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.dsavisualizer.dto.CodeExecutionRequest;
import com.dsavisualizer.dto.CodeExecutionResponse;
import com.dsavisualizer.dto.ExecutionStatus;
import com.dsavisualizer.service.CodeExecutionService;
import com.dsavisualizer.service.ExecutionRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class CodeExecutionControllerTest {
    @Mock private CodeExecutionService executionService;
    @Mock private ExecutionRateLimiter rateLimiter;
    @Mock private HttpServletRequest servletRequest;

    private CodeExecutionController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new CodeExecutionController(executionService, rateLimiter);
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
    }

    @Test
    void anonymousExecutionIsRejectedBeforeService() {
        var response = controller.executeCode(request(), anonymous(), servletRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verifyNoInteractions(executionService, rateLimiter);
    }

    @Test
    void authenticatedExecutionCanBeRateLimitedBeforeService() {
        when(rateLimiter.tryAcquire("learner@example.com", "127.0.0.1")).thenReturn(false);

        var response = controller.executeCode(request(), authenticated(), servletRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getBody().getStatus()).isEqualTo(ExecutionStatus.RATE_LIMITED);
        verifyNoInteractions(executionService);
    }

    @Test
    void invalidServiceResultUsesAStableBadRequestStatus() {
        when(rateLimiter.tryAcquire(any(), any())).thenReturn(true);
        when(executionService.executeCode(any(), eq("learner@example.com")))
                .thenReturn(CodeExecutionResponse.failure(ExecutionStatus.VALIDATION_ERROR, "Invalid execution request"));

        var response = controller.executeCode(request(), authenticated(), servletRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getStatus()).isEqualTo(ExecutionStatus.VALIDATION_ERROR);
    }

    @Test
    void limiterUsesBothAuthenticatedSubjectAndRemoteIp() {
        when(rateLimiter.tryAcquire(any(), any())).thenReturn(true);
        when(executionService.executeCode(any(), eq("learner@example.com")))
                .thenReturn(CodeExecutionResponse.failure(ExecutionStatus.NO_TEST_CASES, "No tests"));

        controller.executeCode(request(), authenticated(), servletRequest);

        verify(rateLimiter).tryAcquire("learner@example.com", "127.0.0.1");
    }

    private CodeExecutionRequest request() {
        return new CodeExecutionRequest("return 1", "python", 1L, null, null);
    }

    private UsernamePasswordAuthenticationToken authenticated() {
        return new UsernamePasswordAuthenticationToken("learner@example.com", "credentials", java.util.List.of());
    }

    private AnonymousAuthenticationToken anonymous() {
        return new AnonymousAuthenticationToken("key", "anonymous",
                java.util.List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")));
    }
}
