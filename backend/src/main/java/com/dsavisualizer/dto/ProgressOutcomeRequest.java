package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProgressOutcomeRequest(
        @Size(max = 32)
        String status,
        @JsonProperty("resultStatus")
        @JsonAlias("result_status")
        @Size(max = 32)
        String resultStatus,
        @Size(max = 32)
        String language,
        @Size(max = 100_000)
        String code,
        @JsonProperty("receiptId")
        @JsonAlias("receipt_id")
        @Size(max = 256)
        String receiptId,
        @PositiveOrZero
        @Max(86_400)
        Double runtime,
        @PositiveOrZero
        @Max(1_000_000)
        Integer memory
) {
}
