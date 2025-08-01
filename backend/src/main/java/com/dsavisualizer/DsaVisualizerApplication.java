package com.dsavisualizer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DsaVisualizerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DsaVisualizerApplication.class, args);
    }
}