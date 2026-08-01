package com.dsavisualizer.service;

public class InvalidResetRequestException extends RuntimeException {
    public InvalidResetRequestException() {
        super("Invalid or expired password reset request");
    }
}
