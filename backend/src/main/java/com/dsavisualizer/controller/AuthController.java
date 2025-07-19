package com.dsavisualizer.controller;

import com.dsavisualizer.dto.ChangePasswordRequest;
import com.dsavisualizer.dto.LoginRequest;
import com.dsavisualizer.dto.RegisterRequest;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.security.JwtUtil;
import com.dsavisualizer.service.UserService;
import com.dsavisualizer.service.VerificationTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
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
        User user = userService.createUser(registerRequest);
        verificationTokenService.createVerificationToken(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful! Please check your email to verify your account.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        User user = (User) authentication.getPrincipal();
        if (!user.isEmailVerified()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Please verify your email before logging in.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        String jwt = jwtUtil.generateToken(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("type", "Bearer");
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        
        return ResponseEntity.ok(response);
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
    public ResponseEntity<?> resendVerificationEmail(@RequestParam String email) {
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
            return ResponseEntity.badRequest().body(response);
        }

        verificationTokenService.createVerificationToken(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Verification email sent successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        User user = (User) authentication.getPrincipal();
        // Return the user info needed by your frontend
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        // Add any other fields you want to expose
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            Authentication authentication) {
        
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User user = (User) authentication.getPrincipal();
        Map<String, String> response = new HashMap<>();
        try {
            userService.changePassword(
                user,
                changePasswordRequest.getCurrentPassword(),
                changePasswordRequest.getNewPassword()
            );
            
            response.put("message", "Password updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("message", "Failed to update password");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User user = (User) authentication.getPrincipal();
        Map<String, String> response = new HashMap<>();
        
        try {
            userService.deleteAccount(user);
            response.put("message", "Account deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to delete account: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}