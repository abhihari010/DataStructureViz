package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePassword(
    @JsonProperty("password")
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    String password,

    @JsonProperty("repeatPassword")
    @NotBlank(message = "Password confirmation is required")
    String repeatPassword,

    @JsonProperty("resetProof")
    @NotBlank(message = "Reset proof is required")
    String resetProof
) {}
