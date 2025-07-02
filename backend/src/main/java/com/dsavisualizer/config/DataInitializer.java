package com.dsavisualizer.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserDataInitializer userDataInitializer;
    private final PracticeProblemDataInitializer practiceProblemDataInitializer;

    @Autowired
    public DataInitializer(UserDataInitializer userDataInitializer, PracticeProblemDataInitializer practiceProblemDataInitializer) {
        this.userDataInitializer = userDataInitializer;
        this.practiceProblemDataInitializer = practiceProblemDataInitializer;
    }

    @Override
    public void run(String... args) throws Exception {
        userDataInitializer.initializeUsers();
        practiceProblemDataInitializer.initializeProblems();
    }
}