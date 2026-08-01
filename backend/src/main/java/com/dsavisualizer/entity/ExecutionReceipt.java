package com.dsavisualizer.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "execution_receipts", indexes = {
        @Index(name = "ux_execution_receipt_hash", columnList = "receipt_id_hash", unique = true),
        @Index(name = "ix_execution_receipt_consume", columnList = "user_id,problem_id,consumed_at")
})
public class ExecutionReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_id_hash", nullable = false, length = 64, unique = true)
    private String receiptIdHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private PracticeProblem problem;

    @Column(name = "code_hash", nullable = false, length = 64)
    private String codeHash;

    @Column(nullable = false, length = 20)
    private String language;

    @Column(name = "test_set_version", nullable = false, length = 64)
    private String testSetVersion;

    @Column(nullable = false, length = 32)
    private String result;

    @Column
    private Double runtime;

    @Column
    private Integer memory;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    public Long getId() { return id; }
    public String getReceiptIdHash() { return receiptIdHash; }
    public void setReceiptIdHash(String receiptIdHash) { this.receiptIdHash = receiptIdHash; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public PracticeProblem getProblem() { return problem; }
    public void setProblem(PracticeProblem problem) { this.problem = problem; }
    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getTestSetVersion() { return testSetVersion; }
    public void setTestSetVersion(String testSetVersion) { this.testSetVersion = testSetVersion; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public Double getRuntime() { return runtime; }
    public void setRuntime(Double runtime) { this.runtime = runtime; }
    public Integer getMemory() { return memory; }
    public void setMemory(Integer memory) { this.memory = memory; }
    public Instant getIssuedAt() { return issuedAt; }
    public void setIssuedAt(Instant issuedAt) { this.issuedAt = issuedAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getConsumedAt() { return consumedAt; }
    public void setConsumedAt(Instant consumedAt) { this.consumedAt = consumedAt; }
}
