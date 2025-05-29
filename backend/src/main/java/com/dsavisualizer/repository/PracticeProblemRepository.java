package com.dsavisualizer.repository;

import com.dsavisualizer.entity.PracticeProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeProblemRepository extends JpaRepository<PracticeProblem, Long> {
    List<PracticeProblem> findByTopicId(String topicId);
    List<PracticeProblem> findByDifficulty(String difficulty);
}