package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitSolutionRequest(
        @NotNull @JsonProperty("problemId") Long problemId,
        @NotBlank @JsonProperty("code") String code,
        @NotBlank @JsonProperty("language") String language,
        @NotBlank @JsonProperty("receipt_id") String receiptId,
        @JsonProperty("runtime") Double runtime,
        @JsonProperty("memory") Integer memory
) {
}
