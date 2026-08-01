package com.dsavisualizer.controller;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserSolution;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.repository.UserSolutionRepository;
import com.dsavisualizer.service.UserProgressService;
import com.dsavisualizer.dto.UserSolutionResponse;
import com.dsavisualizer.dto.SubmitSolutionRequest;
import com.dsavisualizer.service.ExecutionReceiptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/solutions")
public class SolutionController {

    private final UserSolutionRepository userSolutionRepository;
    private final PracticeProblemRepository practiceProblemRepository;
    private final UserProgressService userProgressService;
    private final ExecutionReceiptService executionReceiptService;

    public SolutionController(UserSolutionRepository userSolutionRepository, PracticeProblemRepository practiceProblemRepository,
                              UserProgressService userProgressService, ExecutionReceiptService executionReceiptService) {
        this.userSolutionRepository = userSolutionRepository;
        this.practiceProblemRepository = practiceProblemRepository;
        this.userProgressService = userProgressService;
        this.executionReceiptService = executionReceiptService;
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
    @Transactional
    public ResponseEntity<?> saveSolution(@Valid @RequestBody SubmitSolutionRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        PracticeProblem problem = practiceProblemRepository.findById(request.problemId()).orElse(null);
        if (problem == null) return ResponseEntity.notFound().build();

        String testSetVersion = problem.getTestSetVersion() == null ? "v1" : problem.getTestSetVersion();
        boolean validReceipt = executionReceiptService.consumeReceipt(
                request.receiptId(), user.getId(), problem.getId(), request.code(), request.language(), testSetVersion);
        if (!validReceipt) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Execution receipt is invalid, expired, or already used");
        }

        com.dsavisualizer.entity.ExecutionReceipt trustedReceipt = executionReceiptService
                .findReceipt(request.receiptId(), user.getId(), problem.getId());
        if (trustedReceipt == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Execution receipt is unavailable after validation");
        }

        UserSolution solution = new UserSolution(user, problem, request.code(), request.language().trim().toLowerCase());
        solution.setPassed(true);
        solution.setRuntime(trustedReceipt.getRuntime());
        solution.setMemory(trustedReceipt.getMemory());

        UserSolution savedSolution = userSolutionRepository.save(solution);

        userProgressService.recordTrustedSubmission(user, problem, trustedReceipt, request.code(), request.language());

        return ResponseEntity.ok(new UserSolutionResponse(
                savedSolution.getId(), problem.getId(), problem.getTitle(), savedSolution.getCode(),
                savedSolution.getLanguage(), true, savedSolution.getSubmittedAt(), savedSolution.getRuntime(),
                savedSolution.getMemory()));
    }
}
