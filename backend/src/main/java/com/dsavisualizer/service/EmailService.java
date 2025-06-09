package com.dsavisualizer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String frontendBaseUrl;

    public EmailService(JavaMailSender mailSender, 
                       @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendVerificationEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verify your email for DSA Visualizer");
        message.setText(String.format(
            "Welcome to DSA Visualizer!\n\n" +
            "Please click the link below to verify your email address:\n" +
            "%s/verify-email?token=%s\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you did not create an account, please ignore this email.",
            frontendBaseUrl,
            token
        ));
        mailSender.send(message);
    }
} 