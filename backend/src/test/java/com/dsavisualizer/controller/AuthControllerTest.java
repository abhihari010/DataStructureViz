package com.dsavisualizer.controller;

import com.dsavisualizer.dto.LoginRequest;
import com.dsavisualizer.dto.ProfileUpdateRequest;
import com.dsavisualizer.dto.RegisterRequest;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.security.JwtUtil;
import com.dsavisualizer.service.DuplicateEmailException;
import com.dsavisualizer.service.EmailVerificationRequiredException;
import com.dsavisualizer.service.UserService;
import com.dsavisualizer.service.VerificationTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import jakarta.validation.Validation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {
    private final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
    private final VerificationTokenService verificationTokenService = mock(VerificationTokenService.class);
    private final UserService userService = mock(UserService.class);
    private final AuthController controller = new AuthController(
            authenticationManager, mock(JwtUtil.class), userService, verificationTokenService);
    private final User user = new User("user-1", "learner@example.com", "hash", "Ada", "Lovelace");

    @Test
    void profileUpdateReturnsPersistedUser() {
        when(userService.updateProfile(any(User.class), any(ProfileUpdateRequest.class))).thenReturn(user);
        Authentication authentication = authenticationFor(user);

        var response = controller.updateProfile(
                new ProfileUpdateRequest("Grace", "Hopper", "learner@example.com"), authentication);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.OK);
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("email", "learner@example.com");
        verify(userService).updateProfile(eq(user), any(ProfileUpdateRequest.class));
    }

    @Test
    void profileEmailChangeRequiresVerification() {
        when(userService.updateProfile(any(User.class), any(ProfileUpdateRequest.class)))
                .thenThrow(new EmailVerificationRequiredException());

        var response = controller.updateProfile(
                new ProfileUpdateRequest("Ada", "Lovelace", "new@example.com"), authenticationFor(user));

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.CONFLICT);
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("code", "EMAIL_VERIFICATION_REQUIRED");
    }

    @Test
    void profileRequestRejectsBlankNamesAndMalformedEmail() {
        var violations = Validation.buildDefaultValidatorFactory().getValidator()
                .validate(new ProfileUpdateRequest("", "", "not-an-email"));

        assertThat(violations).hasSize(3);
    }

    @Test
    void registrationReturnsConflictWhenEmailAlreadyExists() {
        when(userService.createUser(any(RegisterRequest.class)))
                .thenThrow(new DuplicateEmailException());

        var response = controller.registerUser(
                new RegisterRequest("Abhi", "Hai", "abhihari010@gmail.com", "password"));

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.CONFLICT);
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("code", "EMAIL_ALREADY_REGISTERED");
        verifyNoInteractions(verificationTokenService);
    }

    @Test
    void loginReturnsUnauthorizedForInvalidCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        var response = controller.authenticateUser(
                new LoginRequest("learner@example.com", "wrong-password"));

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("code", "INVALID_CREDENTIALS");
        assertThat(response.getBody()).hasFieldOrPropertyWithValue(
                "message", "Email or password is incorrect.");
    }

    @Test
    void loginReturnsVerificationInstructionsForUnverifiedAccount() {
        when(authenticationManager.authenticate(any())).thenThrow(new DisabledException("Disabled"));

        var response = controller.authenticateUser(
                new LoginRequest("learner@example.com", "password"));

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("needsVerification", "true");
        assertThat(response.getBody()).hasFieldOrPropertyWithValue("email", "learner@example.com");
    }

    private Authentication authenticationFor(User principal) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        return authentication;
    }
}
