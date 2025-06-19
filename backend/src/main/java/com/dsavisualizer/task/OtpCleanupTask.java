package com.dsavisualizer.task;

import com.dsavisualizer.repository.ForgotPasswordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OtpCleanupTask {
    private static final Logger log = LoggerFactory.getLogger(OtpCleanupTask.class);
    
    private final ForgotPasswordRepository forgotPasswordRepository;
    
    public OtpCleanupTask(ForgotPasswordRepository forgotPasswordRepository) {
        this.forgotPasswordRepository = forgotPasswordRepository;
    }
    
    /**
     * Runs every hour to clean up expired OTPs
     */
    @Scheduled(fixedRate = 60 * 60 * 1000) // Run every hour
    public void cleanupExpiredOtps() {
        try {
            log.info("Starting cleanup of expired OTPs");
            int deletedCount = forgotPasswordRepository.deleteExpiredOtps();
            log.info("Cleaned up {} expired OTPs", deletedCount);
        } catch (Exception e) {
            log.error("Error cleaning up expired OTPs", e);
        }
    }
}
