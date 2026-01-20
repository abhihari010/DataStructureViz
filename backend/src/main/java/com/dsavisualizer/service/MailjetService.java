package com.dsavisualizer.service;

import com.mailjet.client.MailjetClient;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.transactional.SendContact;
import com.mailjet.client.transactional.SendEmailsRequest;
import com.mailjet.client.transactional.TrackOpens;
import com.mailjet.client.transactional.TransactionalEmail;
import com.mailjet.client.transactional.response.SendEmailsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MailjetService {

    private final MailjetClient mailjetClient;
    private final String senderEmail;
    private final String senderName;

    public MailjetService(MailjetClient mailjetClient,
            @Value("${mailjet.sender.email:noreply@example.com}") String senderEmail,
            @Value("${mailjet.sender.name:System}") String senderName) {
        this.mailjetClient = mailjetClient;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
    }

    public boolean sendEmail(String to, String toName, String subject, String htmlContent) {
        try {
            TransactionalEmail message = TransactionalEmail
                    .builder()
                    .to(new SendContact(to, toName))
                    .from(new SendContact(senderEmail, senderName))
                    .htmlPart(htmlContent)
                    .subject(subject)
                    .trackOpens(TrackOpens.ENABLED)
                    .build();

            SendEmailsRequest request = SendEmailsRequest
                    .builder()
                    .message(message)
                    .build();

            SendEmailsResponse response = request.sendWith(mailjetClient);
            return response != null && response.getMessages() != null && response.getMessages().length > 0;
        } catch (MailjetException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            return false;
        }
    }
}
