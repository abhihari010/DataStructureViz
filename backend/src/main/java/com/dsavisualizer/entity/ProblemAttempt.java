package com.dsavisualizer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/** Immutable evidence of one run or submission. Raw learner code is not stored. */
@Entity
@Table(name = "problem_attempts", indexes = {
        @Index(name = "ix_problem_attempts_user_problem_created", columnList = "user_id,problem_id,created_at"),
        @Index(name = "ix_problem_attempts_user_created", columnList = "user_id,created_at"),
        @Index(name = "ix_problem_attempts_receipt", columnList = "execution_receipt_id")
})
public class ProblemAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private PracticeProblem problem;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "result_status", length = 32)
    private String resultStatus;

    @Column(nullable = false, length = 32)
    private String language;

    @Column(name = "code_hash", length = 64)
    private String codeHash;

    @Column
    private Double runtime;

    @Column
    private Integer memory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_receipt_id")
    private ExecutionReceipt executionReceipt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null || status.isBlank()) status = "UNKNOWN";
        if (language == null || language.isBlank()) language = "unknown";
    }

    public ProblemAttempt() {}

    public ProblemAttempt(User user, PracticeProblem problem, String status, String language) {
        this.user = user;
        this.problem = problem;
        this.status = status;
        this.language = language;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public PracticeProblem getProblem() { return problem; }
    public void setProblem(PracticeProblem problem) { this.problem = problem; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResultStatus() { return resultStatus; }
    public void setResultStatus(String resultStatus) { this.resultStatus = resultStatus; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }
    public Double getRuntime() { return runtime; }
    public void setRuntime(Double runtime) { this.runtime = runtime; }
    public Integer getMemory() { return memory; }
    public void setMemory(Integer memory) { this.memory = memory; }
    public ExecutionReceipt getExecutionReceipt() { return executionReceipt; }
    public void setExecutionReceipt(ExecutionReceipt executionReceipt) { this.executionReceipt = executionReceipt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    /** Alias used by progress consumers that call the event timestamp attemptedAt. */
    public Instant getAttemptedAt() { return createdAt; }
    public void setAttemptedAt(Instant attemptedAt) { this.createdAt = attemptedAt; }
}
