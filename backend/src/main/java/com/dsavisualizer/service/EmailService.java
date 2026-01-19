package com.dsavisualizer.service;

import com.dsavisualizer.dto.MailBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String frontendBaseUrl;

    @Value("${spring.mail.username}")
    private String supportEmail;

    public EmailService(JavaMailSender mailSender,
            @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Async
    public void sendVerificationEmail(String to, String token) {
        try {
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
                    token));
            mailSender.send(message);
            logger.info("Verification email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}: {}", to, e.getMessage());
            // Don't throw exception - email is best-effort, don't block user registration
        }
    }

    @Async
    public void sendSimpleMessage(MailBody mailBody) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(mailBody.getTo());
            message.setFrom(supportEmail);
            message.setSubject(mailBody.getSubject());
            message.setText(mailBody.getText());
            mailSender.send(message);
            logger.info("Email sent successfully to {}", mailBody.getTo());
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", mailBody.getTo(), e.getMessage());
        }
    }
}