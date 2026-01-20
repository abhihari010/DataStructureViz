package com.dsavisualizer.config;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MailjetClientConfig {

    @Value("${mailjet.api.key:}")
    private String mailjetApiKey;

    @Value("${mailjet.secret.key:}")
    private String mailjetSecretKey;

    @Bean
    public MailjetClient mailjetClient() {
        if (mailjetApiKey == null || mailjetApiKey.isEmpty() ||
                mailjetSecretKey == null || mailjetSecretKey.isEmpty()) {
            throw new IllegalStateException(
                    "Mailjet API credentials not configured. Set MAILJET_API_KEY and MAILJET_SECRET_KEY environment variables.");
        }

        return new MailjetClient(
                ClientOptions.builder()
                        .apiKey(mailjetApiKey)
                        .apiSecretKey(mailjetSecretKey)
                        .build());
    }
}
