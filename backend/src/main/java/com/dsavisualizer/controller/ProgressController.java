package com.dsavisualizer.controller;

import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserProgress;
import com.dsavisualizer.service.UserProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/progress")
public class ProgressController {

    private final UserProgressService userProgressService;

    public ProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    @GetMapping
    public ResponseEntity<List<UserProgress>> getUserProgress(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<UserProgress> progress = userProgressService.getUserProgress(user.getId());
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<UserProgress> getTopicProgress(@PathVariable String topicId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UserProgress progress = userProgressService.getTopicProgress(user.getId(), topicId);
        return ResponseEntity.ok(progress);
    }

    @PostMapping
    public ResponseEntity<UserProgress> updateProgress(@RequestBody Map<String, Object> progressData, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        String topicId = (String) progressData.get("topicId");
        Boolean completed = (Boolean) progressData.getOrDefault("completed", false);
        Integer score = (Integer) progressData.getOrDefault("score", 0);
        Integer timeSpent = (Integer) progressData.getOrDefault("timeSpent", 0);

        UserProgress progress = userProgressService.updateUserProgress(user, topicId, completed, score, timeSpent);
        return ResponseEntity.ok(progress);
    }
}