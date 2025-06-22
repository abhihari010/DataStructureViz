package com.dsavisualizer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionResponse {
    // Getters and Setters
    private boolean success;
    private String output;
    private String error;
    private boolean passed;
    private Object expectedOutput;


}
