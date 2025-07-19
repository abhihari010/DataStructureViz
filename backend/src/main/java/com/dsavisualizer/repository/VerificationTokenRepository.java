package com.dsavisualizer.repository;

import com.dsavisualizer.entity.VerificationToken;
import com.dsavisualizer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);
    
    @Modifying
    @Query("delete from VerificationToken vt where vt.user = ?1")
    @Transactional
    void deleteByUser(User user);
} 