package com.dsavisualizer.service;

import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserProgress;
import com.dsavisualizer.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserProgressService {

    @Autowired
    private UserProgressRepository userProgressRepository;

    public List<UserProgress> getUserProgress(String userId) {
        return userProgressRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public UserProgress updateUserProgress(User user, String topicId, Boolean completed, Integer score, Integer timeSpent) {
        Optional<UserProgress> existingProgress = userProgressRepository.findByUserIdAndTopicId(user.getId(), topicId);

        UserProgress progress;
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
            progress.setCompleted(completed);
            progress.setScore(score);
            progress.setTimeSpent(timeSpent);
            if (completed && progress.getCompletedAt() == null) {
                progress.setCompletedAt(LocalDateTime.now());
            }
        } else {
            progress = new UserProgress(user, topicId);
            progress.setCompleted(completed);
            progress.setScore(score);
            progress.setTimeSpent(timeSpent);
            if (completed) {
                progress.setCompletedAt(LocalDateTime.now());
            }
        }

        return userProgressRepository.save(progress);
    }

    public UserProgress getTopicProgress(String userId, String topicId) {
        return userProgressRepository.findByUserIdAndTopicId(userId, topicId).orElse(null);
    }
}