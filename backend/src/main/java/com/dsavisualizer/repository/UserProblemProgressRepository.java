package com.dsavisualizer.repository;

import com.dsavisualizer.entity.UserProblemProgress;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProblemProgressRepository extends JpaRepository<UserProblemProgress, Long> {
    Optional<UserProblemProgress> findByUserIdAndProblemId(String userId, Long problemId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from UserProblemProgress p where p.user.id = :userId and p.problem.id = :problemId")
    Optional<UserProblemProgress> findByUserIdAndProblemIdForUpdate(@Param("userId") String userId,
                                                                      @Param("problemId") Long problemId);

    List<UserProblemProgress> findByUserIdOrderByUpdatedAtDesc(String userId);

    List<UserProblemProgress> findByUserIdAndCompletedOrderByUpdatedAtDesc(String userId, Boolean completed);

    boolean existsByUserIdAndProblemId(String userId, Long problemId);

    long countByUserId(String userId);

    long countByUserIdAndCompleted(String userId, Boolean completed);
}
