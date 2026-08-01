package com.dsavisualizer.controller;

import com.dsavisualizer.dto.ChangePasswordRequest;
import com.dsavisualizer.dto.ApiError;
import com.dsavisualizer.dto.LoginRequest;
import com.dsavisualizer.dto.MessageResponse;
import com.dsavisualizer.dto.ProfileUpdateRequest;
import com.dsavisualizer.dto.RegisterRequest;
import com.dsavisualizer.dto.UserResponse;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.security.JwtUtil;
import com.dsavisualizer.service.EmailVerificationRequiredException;
import com.dsavisualizer.service.UserService;
import com.dsavisualizer.service.VerificationTokenService;
import com.dsavisualizer.service.DuplicateEmailException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")

public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final VerificationTokenService verificationTokenService;

    public AuthController(AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserService userService,
            VerificationTokenService verificationTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.verificationTokenService = verificationTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        final User user;
        try {
            user = userService.createUser(registerRequest);
        } catch (DuplicateEmailException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiError("EMAIL_ALREADY_REGISTERED",
                            "An account with this email already exists. Try signing in or resetting your password."));
        }
        verificationTokenService.createVerificationToken(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful! Please check your email to verify your account.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            User user = (User) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());

            return ResponseEntity.ok(response);
        } catch (DisabledException e) {
            // User account is disabled (email not verified)
            Map<String, String> response = new HashMap<>();
            response.put("message",
                    "Your email address has not been verified. Please check your inbox for the verification link.");
            response.put("needsVerification", "true");
            response.put("email", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("INVALID_CREDENTIALS", "Email or password is incorrect."));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        boolean verified = verificationTokenService.verifyEmail(token);
        Map<String, String> response = new HashMap<>();

        if (verified) {
            response.put("message", "Email verified successfully! You can now log in.");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid or expired verification token.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User not found.");
            return ResponseEntity.badRequest().body(response);
        }

        User user = userOpt.get();
        if (user.isEmailVerified()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email is already verified.");
            return ResponseEntity.ok(response);
        }

        // Create new verification token and send email
        verificationTokenService.createVerificationToken(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Verification email has been resent. Please check your inbox.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("UNAUTHENTICATED", "Authentication required"));
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                            Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("UNAUTHENTICATED", "Authentication required"));
        }

        try {
            User updatedUser = userService.updateProfile((User) authentication.getPrincipal(), request);
            return ResponseEntity.ok(UserResponse.from(updatedUser));
        } catch (EmailVerificationRequiredException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiError("EMAIL_VERIFICATION_REQUIRED",
                            "Email changes require verification before they can be applied."));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            Authentication authentication) {

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("UNAUTHENTICATED", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        try {
            userService.changePassword(
                    user,
                    changePasswordRequest.getCurrentPassword(),
                    changePasswordRequest.getNewPassword());

            return ResponseEntity.ok(new MessageResponse("Password updated successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiError("INVALID_PASSWORD", "Current password is incorrect"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("PASSWORD_UPDATE_FAILED", "Unable to update password"));
        }
    }

    @PostMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("UNAUTHENTICATED", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        try {
            userService.deleteAccount(user);
            return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("ACCOUNT_DELETE_FAILED", "Unable to delete account"));
        }
    }
}
