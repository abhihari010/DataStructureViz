package com.dsavisualizer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 80, message = "First name must be 80 characters or fewer")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 80, message = "Last name must be 80 characters or fewer")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 254, message = "Email must be 254 characters or fewer")
        String email
) {}
