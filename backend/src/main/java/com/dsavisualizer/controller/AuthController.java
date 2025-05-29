package com.dsavisualizer.controller;

import com.dsavisualizer.dto.JwtResponse;
import com.dsavisualizer.dto.LoginRequest;
import com.dsavisualizer.dto.RegisterRequest;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.security.JwtUtil;
import com.dsavisualizer.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserService userService;

    @Autowired
    JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken((User) authentication.getPrincipal());

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getEmail(), 
                                                user.getFirstName(), user.getLastName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = userService.createUser(
                registerRequest.getFirstName(),
                registerRequest.getLastName(),
                registerRequest.getEmail(),
                registerRequest.getPassword()
            );

            String jwt = jwtUtil.generateToken(user);
            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getEmail(), 
                                                    user.getFirstName(), user.getLastName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }
}