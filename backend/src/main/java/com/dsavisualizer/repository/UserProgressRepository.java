package com.dsavisualizer.repository;

import com.dsavisualizer.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<UserProgress> findByUserIdAndTopicId(String userId, String topicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select up from UserProgress up where up.user.id = ?1 and up.topicId = ?2")
    Optional<UserProgress> findByUserIdAndTopicIdForUpdate(String userId, String topicId);
    List<UserProgress> findByUserIdAndCompleted(String userId, Boolean completed);
    
    @Modifying
    @Transactional
    @Query("delete from UserProgress up where up.user.id = ?1")
    void deleteByUserId(String userId);
}
