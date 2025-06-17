package com.dsavisualizer.service;

import com.dsavisualizer.dto.RegisterRequest;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return user;
    }

    @Transactional
    public User createUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmailVerified(false);

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        
        // Verify current password
        boolean passwordMatches = passwordEncoder.matches(currentPassword, user.getPassword());

        if (!passwordMatches) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Update to new password
        String encodedNewPassword = passwordEncoder.encode(newPassword);

        user.setPassword(encodedNewPassword);
        User savedUser = userRepository.saveAndFlush(user);
    }

    public User findById(String id) {
        return userRepository.findById(id).orElse(null);
    }
}