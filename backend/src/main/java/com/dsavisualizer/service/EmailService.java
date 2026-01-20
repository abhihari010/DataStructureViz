package com.dsavisualizer.service;

import com.dsavisualizer.dto.MailBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final MailjetService mailjetService;
    private final String frontendBaseUrl;

    public EmailService(MailjetService mailjetService,
            @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.mailjetService = mailjetService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Async
    public void sendVerificationEmail(String to, String token) {
        try {
            String subject = "Verify your email for DSA Visualizer";
            String htmlContent = buildVerificationEmailContent(token);

            boolean sent = mailjetService.sendEmail(to, "", subject, htmlContent);
            if (sent) {
                logger.info("Verification email sent successfully to {}", to);
            } else {
                logger.error("Failed to send verification email to {}", to);
            }
        } catch (Exception e) {
            logger.error("Error sending verification email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendSimpleMessage(MailBody mailBody) {
        try {
            boolean sent = mailjetService.sendEmail(
                    mailBody.getTo(),
                    "",
                    mailBody.getSubject(),
                    "<p>" + mailBody.getText() + "</p>");
            if (sent) {
                logger.info("Email sent successfully to {}", mailBody.getTo());
            } else {
                logger.error("Failed to send email to {}", mailBody.getTo());
            }
        } catch (Exception e) {
            logger.error("Error sending email to {}: {}", mailBody.getTo(), e.getMessage());
        }
    }

    private String buildVerificationEmailContent(String token) {
        return String.format(
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                        "<h2>Welcome to DSA Visualizer!</h2>" +
                        "<p>Please click the button below to verify your email address:</p>" +
                        "<a href='%s/verify-email?token=%s' " +
                        "style='display: inline-block; padding: 12px 24px; margin: 20px 0; " +
                        "background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;'>" +
                        "Verify Email</a>" +
                        "<p>Or copy and paste this link in your browser:</p>" +
                        "<p style='word-break: break-all; color: #666;'>%s/verify-email?token=%s</p>" +
                        "<p style='color: #666; font-size: 12px; margin-top: 30px;'>" +
                        "This link will expire in 24 hours.<br>" +
                        "If you did not create an account, please ignore this email.</p>" +
                        "</div>",
                frontendBaseUrl, token, frontendBaseUrl, token);
    }
}