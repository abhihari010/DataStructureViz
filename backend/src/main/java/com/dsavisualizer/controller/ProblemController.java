package com.dsavisualizer.controller;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/problems")
public class ProblemController {

    @Autowired
    private PracticeProblemRepository practiceProblemRepository;

    @GetMapping
    public ResponseEntity<List<PracticeProblem>> getProblems(@RequestParam(required = false) String topicId) {
        List<PracticeProblem> problems;
        if (topicId != null && !topicId.isEmpty()) {
            problems = practiceProblemRepository.findByTopicId(topicId);
        } else {
            problems = practiceProblemRepository.findAll();
        }
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PracticeProblem> getProblem(@PathVariable Long id) {
        Optional<PracticeProblem> problem = practiceProblemRepository.findById(id);
        if (problem.isPresent()) {
            return ResponseEntity.ok(problem.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}