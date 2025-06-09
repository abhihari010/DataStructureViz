package com.dsavisualizer.service;

import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.VerificationToken;
import com.dsavisualizer.repository.VerificationTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class VerificationTokenService {

    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    public VerificationTokenService(VerificationTokenRepository tokenRepository,
                                  EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void createVerificationToken(User user) {
        // Delete any existing tokens for this user
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        // Create new token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, user);
        tokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);
    }

    @Transactional
    public boolean verifyEmail(String token) {
        return tokenRepository.findByToken(token)
                .filter(verificationToken -> !verificationToken.isExpired())
                .filter(verificationToken -> !verificationToken.isUsed())
                .map(verificationToken -> {
                    User user = verificationToken.getUser();
                    user.setEmailVerified(true);
                    verificationToken.setUsed(true);
                    tokenRepository.save(verificationToken);
                    return true;
                })
                .orElse(false);
    }
} 