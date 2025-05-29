package com.dsavisualizer.repository;

import com.dsavisualizer.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<UserProgress> findByUserIdAndTopicId(String userId, String topicId);
    List<UserProgress> findByUserIdAndCompleted(String userId, Boolean completed);
}