package com.dsavisualizer.repository;

import com.dsavisualizer.entity.ForgotPassword;
import com.dsavisualizer.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Integer> {
    @Query("select fp from ForgotPassword fp where fp.otp = ?1 and fp.user = ?2")
    Optional<ForgotPassword> findByOtpAndUser(Integer otp, User user);
    
    @Query("select fp from ForgotPassword fp where fp.user = ?1")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ForgotPassword> findByUser(User user);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update ForgotPassword fp set fp.otpConsumed = true, fp.otpVerifiedAt = ?3, " +
            "fp.resetProofHash = ?4, fp.resetProofPurpose = ?5, fp.resetProofExpirationTime = ?6, " +
            "fp.resetProofConsumed = false where fp.otp = ?1 and fp.user = ?2 " +
            "and fp.otpConsumed = false and fp.expirationTime > ?3")
    int consumeOtpAndIssueProof(Integer otp, User user, java.util.Date verifiedAt,
                                String resetProofHash, String resetProofPurpose,
                                java.util.Date resetProofExpirationTime);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update ForgotPassword fp set fp.resetProofConsumed = true where " +
            "fp.resetProofHash = ?1 and fp.user = ?2 and fp.resetProofPurpose = ?3 " +
            "and fp.resetProofConsumed = false and fp.resetProofExpirationTime > ?4")
    int consumeResetProof(String resetProofHash, User user, String resetProofPurpose,
                          java.util.Date now);
    
    @Modifying
    @Query("delete from ForgotPassword fp where fp.expirationTime < current_timestamp")
    @Transactional
    int deleteExpiredOtps();
    
    @Modifying
    @Query("delete from ForgotPassword fp where fp.user = ?1")
    @Transactional
    void deleteByUser(User user);
}
