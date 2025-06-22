package com.dsavisualizer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionRequest {
    // Getters and Setters
        @JsonProperty("code")
    private String code;
        @JsonProperty("language")
    private String language;
        @JsonProperty("problemId")
    private Long problemId;
        @JsonProperty("input")
    private Object input;
        @JsonProperty("expectedOutput")
    private Object expectedOutput;


}
