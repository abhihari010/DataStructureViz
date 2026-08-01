package com.dsavisualizer.controller;

import com.dsavisualizer.dto.PublicProblemDto;
import com.dsavisualizer.repository.PracticeProblemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/problems")
public class ProblemController {

    private final PracticeProblemRepository practiceProblemRepository;

    public ProblemController(PracticeProblemRepository practiceProblemRepository) {
        this.practiceProblemRepository = practiceProblemRepository;
    }

    @GetMapping
    public ResponseEntity<List<PublicProblemDto>> getProblems(@RequestParam(required = false) String topicId) {
        List<com.dsavisualizer.entity.PracticeProblem> problems;
        if (topicId != null && !topicId.isEmpty()) {
            problems = practiceProblemRepository.findByTopicId(topicId);
        } else {
            problems = practiceProblemRepository.findAll();
        }
        return ResponseEntity.ok(problems.stream().map(PublicProblemDto::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicProblemDto> getProblem(@PathVariable Long id) {
        Optional<com.dsavisualizer.entity.PracticeProblem> problem = practiceProblemRepository.findById(id);
        if (problem.isPresent()) {
            return ResponseEntity.ok(PublicProblemDto.from(problem.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
