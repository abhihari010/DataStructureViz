package com.dsavisualizer.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record UserSolutionResponse(
    Long id,
    Long problemId,
    String problemTitle,
    String code,
    String language,
    Boolean passed,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime submittedAt,
    Double runtime,
    Integer memory
) {} 