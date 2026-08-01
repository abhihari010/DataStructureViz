package com.dsavisualizer.controller;

import com.dsavisualizer.dto.MessageResponse;
import com.dsavisualizer.service.InvalidResetRequestException;
import com.dsavisualizer.service.PasswordResetService;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ForgotPasswordControllerTest {
    private final PasswordResetService passwordResetService = mock(PasswordResetService.class);
    private final ForgotPasswordController controller = new ForgotPasswordController(passwordResetService);

    @Test
    void resetRequestUsesSameGenericResponseForKnownAndUnknownEmails() {
        var known = controller.sendMail("known@example.com");
        var unknown = controller.sendMail("unknown@example.com");

        assertThat(known.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.ACCEPTED);
        assertThat(unknown.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.ACCEPTED);
        assertThat(known.getBody()).isEqualTo(unknown.getBody());
        verify(passwordResetService).requestReset("known@example.com");
        verify(passwordResetService).requestReset("unknown@example.com");
    }

    @Test
    void invalidOtpReturnsSafeStructuredError() {
        when(passwordResetService.verifyOtp("learner@example.com", 123456))
                .thenThrow(new InvalidResetRequestException());

        var response = controller.verifyOtp("learner@example.com", 123456);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("code", "INVALID_RESET_REQUEST");
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("message",
                "Invalid or expired password reset request.");
    }

    @Test
    void validOtpReturnsProofWithoutPuttingItInTheEmailPath() {
        when(passwordResetService.verifyOtp("learner@example.com", 123456))
                .thenReturn(new PasswordResetService.ResetProof("opaque-proof", Instant.now().plusSeconds(600)));

        var response = controller.verifyOtp("learner@example.com", 123456);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.OK);
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("resetProof", "opaque-proof");
        assertThat(response.getBody()).isNotInstanceOf(String.class);
    }
}
