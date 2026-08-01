package com.dsavisualizer.controller;

import com.dsavisualizer.dto.ProfileUpdateRequest;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.security.JwtUtil;
import com.dsavisualizer.service.EmailVerificationRequiredException;
import com.dsavisualizer.service.UserService;
import com.dsavisualizer.service.VerificationTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import jakarta.validation.Validation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {
    private final UserService userService = mock(UserService.class);
    private final AuthController controller = new AuthController(
            mock(AuthenticationManager.class), mock(JwtUtil.class), userService, mock(VerificationTokenService.class));
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

    private Authentication authenticationFor(User principal) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        return authentication;
    }
}
