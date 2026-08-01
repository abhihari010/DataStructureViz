package com.dsavisualizer.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

@Component
@DependsOn("flyway")
public class DataInitializer implements CommandLineRunner {

    private final PracticeProblemDataInitializer practiceProblemDataInitializer;

    @Autowired
    public DataInitializer(UserDataInitializer userDataInitializer, PracticeProblemDataInitializer practiceProblemDataInitializer) {
        this.practiceProblemDataInitializer = practiceProblemDataInitializer;
    }

    @Override
    public void run(String... args) throws Exception {
        practiceProblemDataInitializer.initializeProblems();
    }
}
