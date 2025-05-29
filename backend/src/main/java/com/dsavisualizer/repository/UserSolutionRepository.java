package com.dsavisualizer.repository;

import com.dsavisualizer.entity.UserSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSolutionRepository extends JpaRepository<UserSolution, Long> {
    List<UserSolution> findByUserIdOrderBySubmittedAtDesc(String userId);
    List<UserSolution> findByUserIdAndProblemId(String userId, Long problemId);
}