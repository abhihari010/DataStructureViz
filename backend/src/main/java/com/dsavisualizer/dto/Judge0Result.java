package com.dsavisualizer.dto;

public record Judge0Result(
    Status status,
    String stdout,
    String stderr,
    String compile_output,
    String message,
    Double time,
    Long memory
) {}
