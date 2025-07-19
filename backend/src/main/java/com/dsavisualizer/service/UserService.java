package com.dsavisualizer.service;

import com.dsavisualizer.dto.RegisterRequest;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.UserRepository;
import com.dsavisualizer.repository.UserProgressRepository;
import com.dsavisualizer.repository.UserSolutionRepository;
import com.dsavisualizer.repository.ForgotPasswordRepository;
import com.dsavisualizer.repository.VerificationTokenRepository;
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
    private final UserProgressRepository userProgressRepository;
    private final UserSolutionRepository userSolutionRepository;
    private final ForgotPasswordRepository forgotPasswordRepository;
    private final VerificationTokenRepository verificationTokenRepository;

    @Autowired
    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      UserProgressRepository userProgressRepository,
                      UserSolutionRepository userSolutionRepository,
                      ForgotPasswordRepository forgotPasswordRepository,
                      VerificationTokenRepository verificationTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userProgressRepository = userProgressRepository;
        this.userSolutionRepository = userSolutionRepository;
        this.forgotPasswordRepository = forgotPasswordRepository;
        this.verificationTokenRepository = verificationTokenRepository;
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

    @Transactional
    public void deleteAccount(User user) {
        String userId = user.getId();
        
        // Delete all related data for the user
        // Delete user progress
        userProgressRepository.deleteByUserId(userId);
        
        // Delete user solutions
        userSolutionRepository.deleteByUserId(userId);
        
        // Delete forgot password records
        forgotPasswordRepository.deleteByUser(user);
        
        // Delete verification tokens
        verificationTokenRepository.deleteByUser(user);
        
        // Finally delete the user
        userRepository.deleteById(userId);
    }
}