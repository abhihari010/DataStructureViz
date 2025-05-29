package com.dsavisualizer.controller;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserSolution;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserSolutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/solutions")
public class SolutionController {

    @Autowired
    private UserSolutionRepository userSolutionRepository;

    @Autowired
    private PracticeProblemRepository practiceProblemRepository;

    @GetMapping
    public ResponseEntity<List<UserSolution>> getUserSolutions(
            @RequestParam(required = false) Long problemId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<UserSolution> solutions;
        
        if (problemId != null) {
            solutions = userSolutionRepository.findByUserIdAndProblemId(user.getId(), problemId);
        } else {
            solutions = userSolutionRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
        }
        
        return ResponseEntity.ok(solutions);
    }

    @PostMapping
    public ResponseEntity<UserSolution> saveSolution(@RequestBody Map<String, Object> solutionData, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Long problemId = Long.valueOf(solutionData.get("problemId").toString());
        String code = (String) solutionData.get("code");
        String language = (String) solutionData.get("language");
        Boolean passed = (Boolean) solutionData.getOrDefault("passed", false);

        PracticeProblem problem = practiceProblemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserSolution solution = new UserSolution(user, problem, code, language);
        solution.setPassed(passed);

        UserSolution savedSolution = userSolutionRepository.save(solution);
        return ResponseEntity.ok(savedSolution);
    }
}