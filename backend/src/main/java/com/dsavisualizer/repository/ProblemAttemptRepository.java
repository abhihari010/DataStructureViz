package com.dsavisualizer.repository;

import com.dsavisualizer.entity.ProblemAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {
    List<ProblemAttempt> findByUserIdAndProblemIdOrderByCreatedAtDesc(String userId, Long problemId);

    List<ProblemAttempt> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndProblemId(String userId, Long problemId);

    long countByUserId(String userId);

    @org.springframework.data.jpa.repository.Query(
            "select count(distinct a.problem.id) from ProblemAttempt a where a.user.id = :userId")
    long countDistinctProblemsByUserId(@org.springframework.data.repository.query.Param("userId") String userId);
}
