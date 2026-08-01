package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

/**
 * Stable, non-secret execution evidence for the trusted submission flow.
 *
 * The opaque id is the only credential-like value exposed to the client. The
 * server must bind it to the authenticated subject when U3 persists/validates
 * receipts; no provider token is ever part of this contract.
 */
public record ExecutionReceipt(
        @JsonProperty("receipt_id") String receiptId,
        @JsonIgnore Long problemId,
        @JsonIgnore String language,
        @JsonIgnore String codeHash,
        @JsonIgnore boolean passed,
        @JsonIgnore Instant issuedAt,
        @JsonIgnore Instant expiresAt
) {
}
