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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

/**
 * The learner's current state for one problem. This is deliberately separate
 * from {@link UserProgress}, which remains the legacy topic aggregate.
 */
@Entity
@Table(name = "user_problem_progress",
        uniqueConstraints = @UniqueConstraint(
                name = "ux_user_problem_progress_user_problem",
                columnNames = {"user_id", "problem_id"}),
        indexes = {
                @Index(name = "ix_user_problem_progress_user_updated", columnList = "user_id,updated_at"),
                @Index(name = "ix_user_problem_progress_problem", columnList = "problem_id"),
                @Index(name = "ix_user_problem_progress_user_completed", columnList = "user_id,completed")
        })
public class UserProblemProgress {
    public static final int MAX_DRAFT_CODE_LENGTH = 100_000;
    public static final String NOT_STARTED = "NOT_STARTED";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String COMPLETED = "COMPLETED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private PracticeProblem problem;

    @Column(name = "draft_code", columnDefinition = "TEXT")
    private String draftCode;

    @Column(name = "draft_language", length = 32)
    private String draftLanguage;

    @Column(name = "time_spent_seconds", nullable = false)
    private Integer timeSpentSeconds = 0;

    @Column(nullable = false, length = 32)
    private String status = NOT_STARTED;

    @Column(name = "best_runtime")
    private Double bestRuntime;

    @Column(name = "best_result_status", length = 32)
    private String bestResultStatus;

    @Column(name = "best_language", length = 32)
    private String bestLanguage;

    @Column(name = "best_code_hash", length = 64)
    private String bestCodeHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_execution_receipt_id")
    private ExecutionReceipt lastExecutionReceipt;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (timeSpentSeconds == null) timeSpentSeconds = 0;
        if (status == null || status.isBlank()) status = NOT_STARTED;
        if (completed == null) completed = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UserProblemProgress() {}

    public UserProblemProgress(User user, PracticeProblem problem) {
        this.user = user;
        this.problem = problem;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public PracticeProblem getProblem() { return problem; }
    public void setProblem(PracticeProblem problem) { this.problem = problem; }
    public String getDraftCode() { return draftCode; }
    public void setDraftCode(String draftCode) { this.draftCode = draftCode; }
    public String getDraftLanguage() { return draftLanguage; }
    public void setDraftLanguage(String draftLanguage) { this.draftLanguage = draftLanguage; }
    public Integer getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(Integer timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getBestRuntime() { return bestRuntime; }
    public void setBestRuntime(Double bestRuntime) { this.bestRuntime = bestRuntime; }
    public String getBestResultStatus() { return bestResultStatus; }
    public void setBestResultStatus(String bestResultStatus) { this.bestResultStatus = bestResultStatus; }
    public String getBestLanguage() { return bestLanguage; }
    public void setBestLanguage(String bestLanguage) { this.bestLanguage = bestLanguage; }
    public String getBestCodeHash() { return bestCodeHash; }
    public void setBestCodeHash(String bestCodeHash) { this.bestCodeHash = bestCodeHash; }
    public ExecutionReceipt getLastExecutionReceipt() { return lastExecutionReceipt; }
    public void setLastExecutionReceipt(ExecutionReceipt lastExecutionReceipt) { this.lastExecutionReceipt = lastExecutionReceipt; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
