package com.dsavisualizer.controller;

import com.dsavisualizer.dto.CodeExecutionRequest;
import com.dsavisualizer.dto.CodeExecutionResponse;
import com.dsavisualizer.service.CodeExecutionService;
import com.dsavisualizer.service.ExecutionRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/execute")
public class CodeExecutionController {

    private final CodeExecutionService executionService;
    private final ExecutionRateLimiter rateLimiter;

    public CodeExecutionController(CodeExecutionService executionService, ExecutionRateLimiter rateLimiter) {
        this.executionService = executionService;
        this.rateLimiter = rateLimiter;
    }


    @PostMapping
    public ResponseEntity<CodeExecutionResponse> executeCode(@Valid @RequestBody CodeExecutionRequest request,
                                                             Authentication authentication,
                                                             HttpServletRequest servletRequest) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(CodeExecutionResponse.failure(
                    com.dsavisualizer.dto.ExecutionStatus.VALIDATION_ERROR, "Authentication is required"));
        }
        String userKey = authentication.getName();
        String ipAddress = servletRequest.getRemoteAddr() == null ? "unknown" : servletRequest.getRemoteAddr();
        if (!rateLimiter.tryAcquire(userKey, ipAddress)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(CodeExecutionResponse.failure(com.dsavisualizer.dto.ExecutionStatus.RATE_LIMITED,
                            "Execution limit reached; try again later"));
        }
        CodeExecutionResponse response = executionService.executeCode(request, userKey);
        HttpStatus status = switch (response.getStatus()) {
            case VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
            case PROBLEM_NOT_FOUND -> HttpStatus.NOT_FOUND;
            default -> HttpStatus.OK;
        };
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    ResponseEntity<CodeExecutionResponse> invalidRequest() {
        return ResponseEntity.badRequest().body(CodeExecutionResponse.failure(
                com.dsavisualizer.dto.ExecutionStatus.VALIDATION_ERROR, "Invalid execution request"));
    }
}
