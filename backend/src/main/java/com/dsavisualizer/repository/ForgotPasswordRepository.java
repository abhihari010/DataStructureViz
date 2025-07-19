package com.dsavisualizer.repository;

import com.dsavisualizer.entity.ForgotPassword;
import com.dsavisualizer.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Integer> {
    @Query("select fp from ForgotPassword fp where fp.otp = ?1 and fp.user = ?2")
    Optional<ForgotPassword> findByOtpAndUser(Integer otp, User user);
    
    @Query("select fp from ForgotPassword fp where fp.user = ?1")
    Optional<ForgotPassword> findByUser(User user);
    
    @Modifying
    @Query("delete from ForgotPassword fp where fp.expirationTime < current_timestamp")
    @Transactional
    int deleteExpiredOtps();
    
    @Modifying
    @Query("delete from ForgotPassword fp where fp.user = ?1")
    @Transactional
    void deleteByUser(User user);
}
