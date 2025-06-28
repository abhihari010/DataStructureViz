package com.dsavisualizer.controller;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserSolution;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserSolutionRepository;
import com.dsavisualizer.service.UserProgressService;
import com.dsavisualizer.dto.UserSolutionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/solutions")
public class SolutionController {

    private final UserSolutionRepository userSolutionRepository;
    private final PracticeProblemRepository practiceProblemRepository;
    private final UserProgressService userProgressService;

    public SolutionController(UserSolutionRepository userSolutionRepository, PracticeProblemRepository practiceProblemRepository, UserProgressService userProgressService) {
        this.userSolutionRepository = userSolutionRepository;
        this.practiceProblemRepository = practiceProblemRepository;
        this.userProgressService = userProgressService;
    }

    @GetMapping
    public ResponseEntity<List<UserSolutionResponse>> getUserSolutions(
            @RequestParam(required = false) Long problemId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<UserSolution> solutions;
        
        if (problemId != null) {
            solutions = userSolutionRepository.findByUserIdAndProblemId(user.getId(), problemId);
        } else {
            solutions = userSolutionRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
        }
        
        // Convert to DTOs to avoid lazy loading issues
        List<UserSolutionResponse> response = solutions.stream()
            .map(solution -> new UserSolutionResponse(
                solution.getId(),
                solution.getProblem().getId(),
                solution.getProblem().getTitle(),
                solution.getCode(),
                solution.getLanguage(),
                solution.getPassed(),
                solution.getSubmittedAt(),
                solution.getRuntime(),
                solution.getMemory()
            ))
            .toList();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<UserSolution> saveSolution(@RequestBody Map<String, Object> solutionData, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Long problemId = Long.valueOf(solutionData.get("problemId").toString());
        String code = (String) solutionData.get("code");
        String language = (String) solutionData.get("language");
        Boolean passed = (Boolean) solutionData.getOrDefault("passed", false);

        // NEW: Get runtime and memory if present
        Double runtime = solutionData.get("runtime") != null ? Double.valueOf(solutionData.get("runtime").toString()) : null;
        Integer memory = solutionData.get("memory") != null ? Integer.valueOf(solutionData.get("memory").toString()) : null;

        PracticeProblem problem = practiceProblemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserSolution solution = new UserSolution(user, problem, code, language);
        solution.setPassed(passed);
        solution.setRuntime(runtime);
        solution.setMemory(memory);

        UserSolution savedSolution = userSolutionRepository.save(solution);

        // If the solution passed, mark the topic as completed in user progress
        if (Boolean.TRUE.equals(passed)) {
            String topicId = problem.getTopicId();
            userProgressService.updateUserProgress(user, topicId, true, null, null);
        }

        return ResponseEntity.ok(savedSolution);
    }
}