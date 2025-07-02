package com.dsavisualizer.config;

import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class UserDataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void initializeUsers() {
        // Check if default admin exists, if not, create it
        if (!userRepository.existsByEmail("admin@dsa.com")) {
            User admin = new User();
            admin.setId(UUID.randomUUID().toString());
            admin.setEmail("admin@dsa.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmailVerified(true);
            userRepository.save(admin);
        }
    }
} 