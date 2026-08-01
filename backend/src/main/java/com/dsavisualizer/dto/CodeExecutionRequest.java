package com.dsavisualizer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionRequest {
    @NotBlank
    @Size(max = 100_000)
    @JsonProperty("code")
    private String code;
    @NotBlank
    @Size(max = 20)
    @JsonProperty("language")
    private String language;
    @NotNull
    @Positive
    @JsonProperty("problemId")
    private Long problemId;
        @JsonProperty("input")
    private Object input;
        @JsonProperty("expectedOutput")
    private Object expectedOutput;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }
    public Object getInput() { return input; }
    public void setInput(Object input) { this.input = input; }
    public Object getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(Object expectedOutput) { this.expectedOutput = expectedOutput; }


}
