package com.dsavisualizer.controller;

import com.dsavisualizer.dto.ApiError;
import com.dsavisualizer.dto.ChangePassword;
import com.dsavisualizer.dto.MessageResponse;
import com.dsavisualizer.service.InvalidResetRequestException;
import com.dsavisualizer.service.PasswordResetService;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/forgot-password")
public class ForgotPasswordController {

    private static final String GENERIC_RESET_MESSAGE =
            "If an account exists for that email, a password reset code has been sent.";
    private static final String INVALID_RESET_MESSAGE =
            "Invalid or expired password reset request.";

    private final PasswordResetService passwordResetService;

    public ForgotPasswordController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/sendMail/{email}")
    public ResponseEntity<MessageResponse> sendMail(@PathVariable String email) {
        try {
            passwordResetService.requestReset(email);
        } catch (RuntimeException e) {
            // Do not expose account existence, email addresses, provider errors, or stack traces.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse(GENERIC_RESET_MESSAGE));
        }
        return ResponseEntity.accepted().body(new MessageResponse(GENERIC_RESET_MESSAGE));
    }

    @PostMapping("/verifyOtp/{otp}/{email}")
    public ResponseEntity<?> verifyOtp(@PathVariable String email, @PathVariable Integer otp) {
        try {
            PasswordResetService.ResetProof proof = passwordResetService.verifyOtp(email, otp);
            return ResponseEntity.ok(new VerifyOtpResponse(
                    "OTP verified successfully.", proof.value(), proof.expiresAt().toString()));
        } catch (InvalidResetRequestException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiError("INVALID_RESET_REQUEST", INVALID_RESET_MESSAGE));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("RESET_UNAVAILABLE", "Unable to process password reset request."));
        }
    }

    @PostMapping("/changePassword/{email}")
    public ResponseEntity<?> changePasswordHandler(@Valid @RequestBody ChangePassword changePassword,
                                                   @PathVariable String email) {
        try {
            passwordResetService.resetPassword(email, changePassword);
            return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
        } catch (InvalidResetRequestException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiError("INVALID_RESET_REQUEST", INVALID_RESET_MESSAGE));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("RESET_UNAVAILABLE", "Unable to process password reset request."));
        }
    }

    private record VerifyOtpResponse(
            String message,
            @JsonProperty("resetProof") String resetProof,
            @JsonProperty("expiresAt") String expiresAt) {}
}
