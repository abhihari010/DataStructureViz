package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChangePassword(
    @JsonProperty("password") String password, 
    @JsonProperty("repeatPassword") String repeatPassword
) {}
