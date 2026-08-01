package com.dsavisualizer.controller;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);
    private static final int DATABASE_VALIDATION_TIMEOUT_SECONDS = 2;

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/health/readiness")
    public ResponseEntity<Map<String, Object>> readiness() {
        boolean databaseReady = databaseReady();
        Map<String, Object> body = Map.of(
                "status", databaseReady ? "UP" : "DOWN",
                "components", Map.of(
                        "database", Map.of("status", databaseReady ? "UP" : "DOWN"),
                        // Judge0 is external and intentionally does not block readiness.
                        "judge0", Map.of("status", "DEGRADED")));

        return ResponseEntity.status(databaseReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                .body(body);
    }

    private boolean databaseReady() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(DATABASE_VALIDATION_TIMEOUT_SECONDS);
        } catch (SQLException exception) {
            // Do not log the connection URL or exception message; either may contain credentials.
            logger.warn("Readiness database check failed: {}", exception.getClass().getSimpleName());
            return false;
        }
    }
}
