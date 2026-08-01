package com.dsavisualizer.service;

import com.dsavisualizer.dto.ChangePassword;
import com.dsavisualizer.dto.MailBody;
import com.dsavisualizer.entity.ForgotPassword;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.ForgotPasswordRepository;
import com.dsavisualizer.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {
    @Mock UserRepository userRepository;
    @Mock ForgotPasswordRepository forgotPasswordRepository;
    @Mock EmailService emailService;
    @Mock PasswordEncoder passwordEncoder;

    private final User user = new User("user-1", "learner@example.com", "old-hash", "Ada", "Lovelace");

    @Test
    void validOtpIssuesSingleUsePurposeBoundProof() {
        when(userRepository.findByEmailIgnoreCase("learner@example.com")).thenReturn(Optional.of(user));
        when(forgotPasswordRepository.consumeOtpAndIssueProof(
                eq(123456), eq(user), any(Date.class), anyString(),
                eq(ForgotPassword.RESET_PASSWORD_PURPOSE), any(Date.class))).thenReturn(1);

        PasswordResetService.ResetProof result = service().verifyOtp(" LEARNER@example.com ", 123456);

        assertThat(result.value()).isNotBlank();
        assertThat(result.value()).doesNotContain("learner@example.com");
        assertThat(result.expiresAt()).isAfter(Instant.now());
        verify(forgotPasswordRepository).consumeOtpAndIssueProof(
                eq(123456), eq(user), any(Date.class), argThat(hash -> !hash.equals(result.value())),
                eq(ForgotPassword.RESET_PASSWORD_PURPOSE), any(Date.class));
    }

    @Test
    void invalidOtpDoesNotIssueProof() {
        when(userRepository.findByEmailIgnoreCase("learner@example.com")).thenReturn(Optional.of(user));
        when(forgotPasswordRepository.consumeOtpAndIssueProof(
                eq(123456), eq(user), any(Date.class), anyString(),
                eq(ForgotPassword.RESET_PASSWORD_PURPOSE), any(Date.class))).thenReturn(0);

        assertThatThrownBy(() -> service().verifyOtp("learner@example.com", 123456))
                .isInstanceOf(InvalidResetRequestException.class);
    }

    @Test
    void resetPasswordConsumesProofAndUpdatesPassword() {
        when(userRepository.findByEmailIgnoreCase("learner@example.com")).thenReturn(Optional.of(user));
        when(forgotPasswordRepository.consumeResetProof(
                anyString(), eq(user), eq(ForgotPassword.RESET_PASSWORD_PURPOSE), any(Date.class)))
                .thenReturn(1);
        when(passwordEncoder.encode("NewPassword1")).thenReturn("new-hash");
        when(userRepository.save(user)).thenReturn(user);

        service().resetPassword("learner@example.com",
                new ChangePassword("NewPassword1", "NewPassword1", "proof-token"));

        assertThat(user.getPassword()).isEqualTo("new-hash");
        verify(forgotPasswordRepository).consumeResetProof(
                anyString(), eq(user), eq(ForgotPassword.RESET_PASSWORD_PURPOSE), any(Date.class));
        verify(userRepository).save(user);
    }

    @Test
    void expiredReusedOrMismatchedProofCannotUpdatePassword() {
        when(userRepository.findByEmailIgnoreCase("learner@example.com")).thenReturn(Optional.of(user));
        when(forgotPasswordRepository.consumeResetProof(
                anyString(), eq(user), eq(ForgotPassword.RESET_PASSWORD_PURPOSE), any(Date.class)))
                .thenReturn(0);

        assertThatThrownBy(() -> service().resetPassword("learner@example.com",
                new ChangePassword("NewPassword1", "NewPassword1", "expired-or-replayed")))
                .isInstanceOf(InvalidResetRequestException.class);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetRequestsThrottleAfterThreeAttemptsInWindow() {
        ForgotPassword record = ForgotPassword.builder()
                .user(user)
                .requestCount(3)
                .requestWindowStartedAt(new Date())
                .build();
        when(userRepository.findByEmailIgnoreCase("learner@example.com")).thenReturn(Optional.of(user));
        when(forgotPasswordRepository.findByUser(user)).thenReturn(Optional.of(record));

        service().requestReset("learner@example.com");

        verify(forgotPasswordRepository, never()).save(any(ForgotPassword.class));
        verify(emailService, never()).sendSimpleMessage(any(MailBody.class));
    }

    private PasswordResetService service() {
        return new PasswordResetService(userRepository, forgotPasswordRepository, emailService, passwordEncoder);
    }
}
