package com.dsavisualizer.repository;

import com.dsavisualizer.entity.UserSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface UserSolutionRepository extends JpaRepository<UserSolution, Long> {
    List<UserSolution> findByUserIdOrderBySubmittedAtDesc(String userId);
    List<UserSolution> findByUserIdAndProblemId(String userId, Long problemId);
    
    @Modifying
    @Transactional
    @Query("delete from UserSolution us where us.user.id = ?1")
    void deleteByUserId(String userId);
}