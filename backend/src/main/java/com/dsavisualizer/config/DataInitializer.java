package com.dsavisualizer.config;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PracticeProblemRepository practiceProblemRepository;

    public DataInitializer(PracticeProblemRepository practiceProblemRepository) {
        this.practiceProblemRepository = practiceProblemRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (practiceProblemRepository.count() == 0) {
            initializePracticeProblems();
        }
    }

    private void initializePracticeProblems() {
        // Stack problems
        PracticeProblem validParentheses = new PracticeProblem(
            "Valid Parentheses",
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            "easy",
            "stack"
        );
        validParentheses.setTestCases("[{\"input\":\"()\",\"output\":true},{\"input\":\"()[]{}\",\"output\":true},{\"input\":\"(]\",\"output\":false}]");

        PracticeProblem minStack = new PracticeProblem(
            "Min Stack",
            "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
            "medium",
            "stack"
        );
        
        // Queue problems
        PracticeProblem implementQueue = new PracticeProblem(
            "Implement Queue using Stacks",
            "Implement a first in first out (FIFO) queue using only two stacks.",
            "easy",
            "queue"
        );

        // Linked List problems
        PracticeProblem reverseLinkedList = new PracticeProblem(
            "Reverse Linked List",
            "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            "easy",
            "linked-list"
        );

        practiceProblemRepository.save(validParentheses);
        practiceProblemRepository.save(minStack);
        practiceProblemRepository.save(implementQueue);
        practiceProblemRepository.save(reverseLinkedList);
    }
}