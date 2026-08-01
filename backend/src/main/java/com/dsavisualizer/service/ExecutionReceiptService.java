package com.dsavisualizer.service;

import com.dsavisualizer.dto.CodeExecutionResponse;
import com.dsavisualizer.dto.ExecutionReceipt;
import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.ExecutionReceiptRepository;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserRepository;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.core.MethodParameter;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;

@ControllerAdvice
public class ExecutionReceiptService implements ResponseBodyAdvice<CodeExecutionResponse> {
    private final ExecutionReceiptRepository receiptRepository;
    private final PracticeProblemRepository problemRepository;
    private final UserRepository userRepository;

    public ExecutionReceiptService(ExecutionReceiptRepository receiptRepository,
                                   PracticeProblemRepository problemRepository,
                                   UserRepository userRepository) {
        this.receiptRepository = receiptRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return CodeExecutionResponse.class.isAssignableFrom(returnType.getParameterType());
    }

    @Override
    public CodeExecutionResponse beforeBodyWrite(CodeExecutionResponse body, MethodParameter returnType,
                                                 org.springframework.http.MediaType selectedContentType,
                                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                                 ServerHttpRequest request, ServerHttpResponse response) {
        if (body != null && body.isPassed() && body.getReceipt() != null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = authenticatedUser(authentication);
            if (user != null) {
                store(body.getReceipt(), user.getId(), body.getRuntime(), body.getMemory());
            }
        }
        return body;
    }

    @Transactional
    public void store(ExecutionReceipt receipt, String userId) {
        store(receipt, userId, null, null);
    }

    @Transactional
    public void store(ExecutionReceipt receipt, String userId, Double runtime, Integer memory) {
        if (receipt == null || !receipt.passed() || userId == null || userId.isBlank()) return;
        PracticeProblem problem = problemRepository.findById(receipt.problemId())
                .orElseThrow(() -> new IllegalStateException("Receipt references an unknown problem"));
        User user = userRepository.getReferenceById(userId);

        com.dsavisualizer.entity.ExecutionReceipt entity = new com.dsavisualizer.entity.ExecutionReceipt();
        entity.setReceiptIdHash(sha256(receipt.receiptId()));
        entity.setUser(user);
        entity.setProblem(problem);
        entity.setCodeHash(receipt.codeHash());
        entity.setLanguage(receipt.language().trim().toLowerCase());
        entity.setTestSetVersion(problem.getTestSetVersion() == null ? "v1" : problem.getTestSetVersion());
        entity.setResult("ACCEPTED");
        entity.setRuntime(runtime);
        entity.setMemory(memory);
        entity.setIssuedAt(receipt.issuedAt());
        entity.setExpiresAt(receipt.expiresAt());
        receiptRepository.save(entity);
    }

    public boolean consumeReceipt(String receiptId, String userId, Long problemId, String code,
                                  String language, String testSetVersion) {
        if (receiptId == null || receiptId.isBlank() || userId == null || problemId == null
                || code == null || language == null || testSetVersion == null) return false;
        return receiptRepository.consumeIfValid(sha256(receiptId), userId, problemId, sha256(code),
                language.trim().toLowerCase(), testSetVersion, Instant.now()) == 1;
    }

    @Transactional(readOnly = true)
    public com.dsavisualizer.entity.ExecutionReceipt findReceipt(String receiptId, String userId, Long problemId) {
        if (receiptId == null || receiptId.isBlank() || userId == null || problemId == null) return null;
        return receiptRepository.findByReceiptIdHashAndUserIdAndProblemId(
                sha256(receiptId), userId, problemId).orElse(null);
    }

    private User authenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        if (authentication.getPrincipal() instanceof User user) return user;
        return userRepository.findByEmailIgnoreCase(authentication.getName()).orElse(null);
    }

    public static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to fingerprint execution evidence", exception);
        }
    }
}
