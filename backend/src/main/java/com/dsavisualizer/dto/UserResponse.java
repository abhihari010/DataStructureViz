package com.dsavisualizer.dto;

import com.dsavisualizer.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;

public record UserResponse(
        @JsonProperty("id")
        String id,
        @JsonProperty("email")
        String email,
        @JsonProperty("firstName")
        String firstName,
        @JsonProperty("lastName")
        String lastName,
        @JsonProperty("profileImageUrl")
        String profileImageUrl
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileImageUrl());
    }
}
