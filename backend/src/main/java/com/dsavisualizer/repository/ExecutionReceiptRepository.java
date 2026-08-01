package com.dsavisualizer.repository;

import com.dsavisualizer.entity.ExecutionReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface ExecutionReceiptRepository extends JpaRepository<ExecutionReceipt, Long> {
    Optional<ExecutionReceipt> findByReceiptIdHashAndUserIdAndProblemId(String receiptIdHash,
                                                                         String userId,
                                                                         Long problemId);

    @Modifying
    @Query("""
            update ExecutionReceipt r
               set r.consumedAt = :consumedAt
             where r.receiptIdHash = :receiptIdHash
               and r.user.id = :userId
               and r.problem.id = :problemId
               and r.codeHash = :codeHash
               and r.language = :language
               and r.testSetVersion = :testSetVersion
               and r.result = 'ACCEPTED'
               and r.expiresAt > :now
               and r.consumedAt is null
            """)
    int consumeIfValid(@Param("receiptIdHash") String receiptIdHash,
                       @Param("userId") String userId,
                       @Param("problemId") Long problemId,
                       @Param("codeHash") String codeHash,
                       @Param("language") String language,
                       @Param("testSetVersion") String testSetVersion,
                       @Param("now") Instant now);
}
