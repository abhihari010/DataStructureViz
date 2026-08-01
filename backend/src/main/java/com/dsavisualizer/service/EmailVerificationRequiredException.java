package com.dsavisualizer.service;

public class EmailVerificationRequiredException extends RuntimeException {
    public EmailVerificationRequiredException() {
        super("Email changes require verification");
    }
}
