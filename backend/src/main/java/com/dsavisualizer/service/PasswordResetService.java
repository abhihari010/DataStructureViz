package com.dsavisualizer.service;

import com.dsavisualizer.dto.ChangePassword;
import com.dsavisualizer.dto.MailBody;
import com.dsavisualizer.entity.ForgotPassword;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.ForgotPasswordRepository;
import com.dsavisualizer.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Locale;

@Service
public class PasswordResetService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final Duration OTP_LIFETIME = Duration.ofMinutes(10);
    private static final Duration RESET_PROOF_LIFETIME = Duration.ofMinutes(10);
    private static final Duration REQUEST_WINDOW = Duration.ofMinutes(15);
    private static final int MAX_REQUESTS_PER_WINDOW = 3;

    private final UserRepository userRepository;
    private final ForgotPasswordRepository forgotPasswordRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(UserRepository userRepository,
                                ForgotPasswordRepository forgotPasswordRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.forgotPasswordRepository = forgotPasswordRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void requestReset(String requestedEmail) {
        String email = normalizeEmail(requestedEmail);
        if (email == null) {
            return;
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            // The controller deliberately returns the same public response for this case.
            return;
        }

        Instant now = Instant.now();
        ForgotPassword record = forgotPasswordRepository.findByUser(user).orElseGet(() ->
                ForgotPassword.builder().user(user).requestCount(0).build());

        Date windowStart = record.getRequestWindowStartedAt();
        int existingRequestCount = record.getRequestCount() == null ? 0 : record.getRequestCount();
        if (windowStart != null && windowStart.toInstant().plus(REQUEST_WINDOW).isAfter(now)
                && existingRequestCount >= MAX_REQUESTS_PER_WINDOW) {
            log.warn("Password reset request throttled for user id {}", user.getId());
            return;
        }

        int requestCount = windowStart == null || !windowStart.toInstant().plus(REQUEST_WINDOW).isAfter(now)
                ? 1
                : existingRequestCount + 1;
        record.setRequestCount(requestCount);
        record.setRequestWindowStartedAt(requestCount == 1 ? Date.from(now) : windowStart);
        record.setOtp(secureRandom.nextInt(100_000, 1_000_000));
        record.setExpirationTime(Date.from(now.plus(OTP_LIFETIME)));
        record.setOtpConsumed(false);
        record.setOtpVerifiedAt(null);
        record.setResetProofHash(null);
        record.setResetProofPurpose(null);
        record.setResetProofExpirationTime(null);
        record.setResetProofConsumed(false);
        forgotPasswordRepository.save(record);

        emailService.sendSimpleMessage(MailBody.builder()
                .to(user.getEmail())
                .text("This is the OTP for your Forgot Password request: " + record.getOtp())
                .subject("OTP for Forgot Password request")
                .build());
    }

    @Transactional
    public ResetProof verifyOtp(String requestedEmail, Integer otp) {
        String email = normalizeEmail(requestedEmail);
        if (email == null || otp == null) {
            throw new InvalidResetRequestException();
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(InvalidResetRequestException::new);
        Instant now = Instant.now();
        String proof = generateProof();
        Date proofExpiration = Date.from(now.plus(RESET_PROOF_LIFETIME));
        int consumed = forgotPasswordRepository.consumeOtpAndIssueProof(
                otp,
                user,
                Date.from(now),
                hash(proof),
                ForgotPassword.RESET_PASSWORD_PURPOSE,
                proofExpiration);
        if (consumed != 1) {
            throw new InvalidResetRequestException();
        }
        return new ResetProof(proof, proofExpiration.toInstant());
    }

    @Transactional
    public void resetPassword(String requestedEmail, ChangePassword request) {
        if (request == null || request.password() == null || request.repeatPassword() == null
                || !request.password().equals(request.repeatPassword())) {
            throw new InvalidResetRequestException();
        }

        String email = normalizeEmail(requestedEmail);
        if (email == null || request.resetProof() == null || request.resetProof().isBlank()) {
            throw new InvalidResetRequestException();
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(InvalidResetRequestException::new);
        int consumed = forgotPasswordRepository.consumeResetProof(
                hash(request.resetProof().trim()),
                user,
                ForgotPassword.RESET_PASSWORD_PURPOSE,
                Date.from(Instant.now()));
        if (consumed != 1) {
            throw new InvalidResetRequestException();
        }

        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
    }

    private String generateProof() {
        byte[] proof = new byte[32];
        secureRandom.nextBytes(proof);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(proof);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Reset proof hashing is unavailable", e);
        }
    }

    public record ResetProof(String value, Instant expiresAt) {}
}
