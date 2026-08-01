package com.dsavisualizer.controller;

import com.dsavisualizer.dto.ProgressAttemptResponse;
import com.dsavisualizer.dto.ProgressDraftRequest;
import com.dsavisualizer.dto.ProgressOutcomeRequest;
import com.dsavisualizer.dto.ProgressProblemResponse;
import com.dsavisualizer.dto.ProgressSummaryResponse;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.service.UserProgressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/progress")
public class ProgressController {
    private final UserProgressService userProgressService;

    public ProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    /** Alias retained for the existing dashboard while the feature API moves to /problems. */
    @GetMapping
    public ResponseEntity<List<ProgressProblemResponse>> getUserProgress(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(userProgressService.getProblemProgress(user.getId()));
    }

    @GetMapping("/problems")
    public ResponseEntity<List<ProgressProblemResponse>> getProblemProgress(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(userProgressService.getProblemProgress(user.getId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ProgressSummaryResponse> getSummary(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(userProgressService.getSummary(user.getId()));
    }

    @GetMapping("/problems/{problemId}")
    public ResponseEntity<ProgressProblemResponse> getProblemProgress(@PathVariable Long problemId,
                                                                       Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(userProgressService.getProblemProgress(user.getId(), problemId));
    }

    @GetMapping("/problems/{problemId}/attempts")
    public ResponseEntity<List<ProgressAttemptResponse>> getAttempts(@PathVariable Long problemId,
                                                                       Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(userProgressService.getAttempts(user.getId(), problemId));
    }

    @PutMapping("/problems/{problemId}/draft")
    public ResponseEntity<ProgressProblemResponse> saveDraft(@PathVariable Long problemId,
                                                               @Valid @RequestBody ProgressDraftRequest request,
                                                               Authentication authentication) {
        return saveDraftResponse(problemId, request, authentication);
    }

    @PostMapping("/problems/{problemId}/draft")
    public ResponseEntity<ProgressProblemResponse> createOrReplaceDraft(@PathVariable Long problemId,
                                                                          @Valid @RequestBody ProgressDraftRequest request,
                                                                          Authentication authentication) {
        return saveDraftResponse(problemId, request, authentication);
    }

    @PostMapping({"/problems/{problemId}/attempts", "/problems/{problemId}/outcome",
            "/problems/{problemId}/outcomes"})
    public ResponseEntity<ProgressProblemResponse> recordOutcome(@PathVariable Long problemId,
                                                                   @Valid @RequestBody ProgressOutcomeRequest request,
                                                                   Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(userProgressService.recordOutcome(user, problemId, request));
    }

    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<Map<String, String>> problemNotFound(NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> invalidProgressRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    private ResponseEntity<ProgressProblemResponse> saveDraftResponse(Long problemId,
                                                                        ProgressDraftRequest request,
                                                                        Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(userProgressService.saveDraft(user, problemId, request));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        return user;
    }
}
