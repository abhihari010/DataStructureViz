package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MethodSignature {
    @JsonProperty("parameters")
    private List<Parameter> parameters;
    
    @JsonProperty("returnType")
    private String returnType;
    
    @JsonProperty("description")
    private String description;
    
    @Setter
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Parameter {
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("description")
        private String description;
    }
} 