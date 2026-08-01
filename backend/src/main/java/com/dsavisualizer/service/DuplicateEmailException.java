package com.dsavisualizer.service;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException() {
        super("An account with this email address already exists.");
    }
}
