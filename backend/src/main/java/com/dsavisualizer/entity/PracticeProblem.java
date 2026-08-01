package com.dsavisualizer.entity;

import com.dsavisualizer.dto.MethodSignature;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.vladmihalcea.hibernate.type.json.JsonType;
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

    @Type(JsonType.class)
    @Column(name = "test_cases", columnDefinition = "jsonb")
    @JsonIgnore
    private List<Map<String, Object>> testCases;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    @JsonIgnore
    private Map<String, Map<String, String>> solutions; // Key: language, Value: { code: string, timeComplexity: string, spaceComplexity: string }

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    @JsonIgnore
    private Map<String, String> timeComplexity; // Key: language, Value: time complexity

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    @JsonIgnore
    private Map<String, String> spaceComplexity; // Key: language, Value: space complexity

    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String solution;

    @Type(JsonType.class)
    @Column(name = "examples", columnDefinition = "jsonb")
    private List<Map<String, Object>> examples;

    @Column(name = "test_set_version")
    private String testSetVersion = "v1";

    @Column(columnDefinition = "TEXT")
    private String boilerPlateCode;

    @Column(name = "method_name")
    private String methodName;

    @Type(JsonType.class)
    @Column(name = "method_signature", columnDefinition = "jsonb")
    private MethodSignature methodSignature;

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

    @JsonIgnore
    public List<Map<String, Object>> getTestCases() { return testCases; }
    public void setTestCases(List<Map<String, Object>> testCases) { this.testCases = testCases; }

    @JsonIgnore
    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

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

    @JsonProperty("methodSignature")
    public MethodSignature getMethodSignature() {
        return methodSignature;
    }

    public void setMethodSignature(MethodSignature methodSignature) {
        this.methodSignature = methodSignature;
    }

    @JsonIgnore
    public Map<String, Map<String, String>> getSolutions() { return solutions; }
    public void setSolutions(Map<String, Map<String, String>> solutions) { this.solutions = solutions; }

    @JsonIgnore
    public Map<String, String> getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(Map<String, String> timeComplexity) { this.timeComplexity = timeComplexity; }

    @JsonIgnore
    public Map<String, String> getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(Map<String, String> spaceComplexity) { this.spaceComplexity = spaceComplexity; }

    public List<Map<String, Object>> getExamples() { return examples; }
    public void setExamples(List<Map<String, Object>> examples) { this.examples = examples; }

    @JsonIgnore
    public String getTestSetVersion() { return testSetVersion; }
    public void setTestSetVersion(String testSetVersion) { this.testSetVersion = testSetVersion; }
}
