package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProgressDraftRequest(
        @JsonProperty("draftCode")
        @JsonAlias("draft_code")
        @Size(max = 100_000)
        String draftCode,
        @JsonProperty("draftLanguage")
        @JsonAlias("draft_language")
        @Size(max = 32)
        String draftLanguage,
        @JsonProperty("timeSpentSeconds")
        @JsonAlias("time_spent_seconds")
        @PositiveOrZero
        @Max(604_800)
        Integer timeSpentSeconds
) {
}
