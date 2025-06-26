package com.dsavisualizer.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "practice_problems")
public class PracticeProblem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String difficulty; // easy, medium, hard

    @Column(name = "topic_id", nullable = false)
    private String topicId;

    @Type(JsonBinaryType.class)
    @Column(name = "test_cases", columnDefinition = "jsonb")
    private List<Map<String, Object>> testCases;

    @Column(columnDefinition = "TEXT")
    private String solution;



    @Column(columnDefinition = "TEXT")
    private String boilerPlateCode;

    @Column(name = "method_name")
    private String methodName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public PracticeProblem() {}

    public PracticeProblem(String title, String description, String difficulty, String topicId) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.topicId = topicId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    @JsonProperty("topicId")
    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    @JsonProperty("testCases")
    public List<Map<String, Object>> getTestCases() { return testCases; }
    public void setTestCases(List<Map<String, Object>> testCases) { this.testCases = testCases; }

    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @JsonProperty("boilerPlateCode")
    public String getBoilerPlateCode() {
        return boilerPlateCode;
    }
    public void setBoilerPlateCode(String boilerPlateCode) {
        this.boilerPlateCode = boilerPlateCode;
    }

    @JsonProperty("methodName")
    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }
}