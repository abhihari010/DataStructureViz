package com.dsavisualizer.config;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PracticeProblemRepository practiceProblemRepository;
    private final ObjectMapper objectMapper;

    public DataInitializer(PracticeProblemRepository practiceProblemRepository, ObjectMapper objectMapper) {
        this.practiceProblemRepository = practiceProblemRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (practiceProblemRepository.count() == 0) {
            initializePracticeProblems();
        }
    }

    private void initializePracticeProblems() throws Exception {
        // Stack problems
        PracticeProblem validParentheses = new PracticeProblem(
            "Valid Parentheses",
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
            "easy",
            "stack"
        );
        validParentheses.setMethodName("isValid");
        validParentheses.setTestCases(objectMapper.readValue("[{\"input\":\"()\",\"output\":true},{\"input\":\"()[]{}\",\"output\":true},{\"input\":\"(]\",\"output\":false},{\"input\":\"([)]\",\"output\":false},{\"input\":\"{[]}\",\"output\":true}]", new TypeReference<List<Map<String, Object>>>() {}));
        validParentheses.setSolution("public boolean isValid(String s) { Stack<Character> stack = new Stack<>(); for (char c : s.toCharArray()) { if (c == '(' || c == '{' || c == '[') { stack.push(c); } else { if (stack.isEmpty()) { return false; } char top = stack.pop(); if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) { return false; } } } return stack.isEmpty(); }");
        validParentheses.setBoilerPlateCode("{\"java\":\"class Solution {\\n    public boolean isValid(String s) {\\n        // Your code here\\n    }\\n}\",\"javascript\":\"/**\\n * @param {string} s\\n * @return {boolean}\\n */\\nvar isValid = function(s) {\\n    // Your code here\\n};\",\"python\":\"class Solution:\\n    def isValid(self, s: str) -> bool:\\n        # Your code here\\n        pass\",\"cpp\":\"class Solution {\\npublic:\\n    bool isValid(string s) {\\n        // Your code here\\n    }\\n};\"}");

        PracticeProblem minStack = new PracticeProblem(
            "Min Stack",
            "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the MinStack class:\n- MinStack() initializes the stack object.\n- void push(int val) pushes the element val onto the stack.\n- void pop() removes the element on the top of the stack.\n- int top() gets the top element of the stack.\n- int getMin() retrieves the minimum element in the stack.\n\nYou must implement a solution with O(1) time complexity for each function.",
            "medium",
            "stack"
        );
        minStack.setTestCases(objectMapper.readValue("[{\"input\":[\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"],\"inputArgs\":[[],[-2],[0],[-3],[],[],[],[]],\"output\":[null,null,null,null,-3,null,0,-2]}]", new TypeReference<List<Map<String, Object>>>() {}));
        minStack.setSolution("class MinStack {\n    private Stack<Integer> stack;\n    private Stack<Integer> minStack;\n\n    public MinStack() {\n        stack = new Stack<>();\n        minStack = new Stack<>();\n    }\n    \n    public void push(int val) {\n        stack.push(val);\n        if (minStack.isEmpty() || val <= minStack.peek()) {\n            minStack.push(val);\n        } else {\n            minStack.push(minStack.peek());\n        }\n    }\n    \n    public void pop() {\n        stack.pop();\n        minStack.pop();\n    }\n    \n    public int top() {\n        return stack.peek();\n    }\n    \n    public int getMin() {\n        return minStack.peek();\n    }\n}");
        minStack.setBoilerPlateCode("{\"java\":\"class MinStack {\\n    public MinStack() {\\n        // Your code here\\n    }\\n    \\n    public void push(int val) {\\n        // Your code here\\n    }\\n    \\n    public void pop() {\\n        // Your code here\\n    }\\n    \\n    public int top() {\\n        // Your code here\\n    }\\n    \\n    public int getMin() {\\n        // Your code here\\n    }\\n}\",\"javascript\":\"class MinStack {\\n    constructor() {\\n        // Your code here\\n    }\\n    \\n    push(val) {\\n        // Your code here\\n    }\\n    \\n    pop() {\\n        // Your code here\\n    }\\n    \\n    top() {\\n        // Your code here\\n    }\\n    \\n    getMin() {\\n        // Your code here\\n    }\\n}\",\"python\":\"class MinStack:\\n    \\n    def __init__(self):\\n        # Your code here\\n        pass\\n    \\n    def push(self, val: int) -> None:\\n        # Your code here\\n        pass\\n    \\n    def pop(self) -> None:\\n        # Your code here\\n        pass\\n    \\n    def top(self) -> int:\\n        # Your code here\\n        pass\\n    \\n    def getMin(self) -> int:\\n        # Your code here\\n        pass\",\"cpp\":\"class MinStack {\\npublic:\\n    MinStack() {\\n        // Your code here\\n    }\\n    \\n    void push(int val) {\\n        // Your code here\\n    }\\n    \\n    void pop() {\\n        // Your code here\\n    }\\n    \\n    int top() {\\n        // Your code here\\n    }\\n    \\n    int getMin() {\\n        // Your code here\\n    }\\n};\"}");

        // Queue problems
        PracticeProblem implementQueue = new PracticeProblem(
            "Implement Queue using Stacks",
            "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).\n\nImplement the MyQueue class:\n- void push(int x) Pushes element x to the back of the queue.\n- int pop() Removes the element from the front of the queue and returns it.\n- int peek() Returns the element at the front of the queue.\n- boolean empty() Returns true if the queue is empty, false otherwise.\n\nYou must use only standard operations of a stack, which means only push to top, peek/pop from top, size, and is empty operations are valid.",
            "easy",
            "queue"
        );
        implementQueue.setTestCases(objectMapper.readValue("[{\"input\":[\"MyQueue\",\"push\",\"push\",\"peek\",\"pop\",\"empty\"],\"inputArgs\":[[],[1],[2],[],[],[]],\"output\":[null,null,null,1,1,false]}]", new TypeReference<List<Map<String, Object>>>() {}));
        implementQueue.setSolution("class MyQueue {\n    private Stack<Integer> input;\n    private Stack<Integer> output;\n\n    public MyQueue() {\n        input = new Stack<>();\n        output = new Stack<>();\n    }\n    \n    public void push(int x) {\n        input.push(x);\n    }\n    \n    public int pop() {\n        peek();\n        return output.pop();\n    }\n    \n    public int peek() {\n        if (output.isEmpty()) {\n            while (!input.isEmpty()) {\n                output.push(input.pop());\n            }\n        }\n        return output.peek();\n    }\n    \n    public boolean empty() {\n        return input.isEmpty() && output.isEmpty();\n    }\n}");
        implementQueue.setBoilerPlateCode("{\"java\":\"class MyQueue {\\n    public MyQueue() {\\n        // Your code here\\n    }\\n    \\n    public void push(int x) {\\n        // Your code here\\n    }\\n    \\n    public int pop() {\\n        // Your code here\\n    }\\n    \\n    public int peek() {\\n        // Your code here\\n    }\\n    \\n    public boolean empty() {\\n        // Your code here\\n    }\\n}\",\"javascript\":\"var MyQueue = function() {\\n    // Your code here\\n};\\n\\n/** \\n * @param {number} x\\n * @return {void}\\n */\\nMyQueue.prototype.push = function(x) {\\n    // Your code here\\n};\\n\\n/**\\n * @return {number}\\n */\\nMyQueue.prototype.pop = function() {\\n    // Your code here\\n};\\n\\n/**\\n * @return {number}\\n */\\nMyQueue.prototype.peek = function() {\\n    // Your code here\\n};\\n\\n/**\\n * @return {boolean}\\n */\\nMyQueue.prototype.empty = function() {\\n    // Your code here\\n};\",\"python\":\"class MyQueue:\\n\\n    def __init__(self):\\n        # Your code here\\n        pass\\n\\n    def push(self, x: int) -> None:\\n        # Your code here\\n        pass\\n\\n    def pop(self) -> int:\\n        # Your code here\\n        pass\\n\\n    def peek(self) -> int:\\n        # Your code here\\n        pass\\n\\n    def empty(self) -> bool:\\n        # Your code here\\n        pass\",\"cpp\":\"class MyQueue {\\npublic:\\n    MyQueue() {\\n        // Your code here\\n    }\\n    \\n    void push(int x) {\\n        // Your code here\\n    }\\n    \\n    int pop() {\\n        // Your code here\\n    }\\n    \\n    int peek() {\\n        // Your code here\\n    }\\n    \\n    bool empty() {\\n        // Your code here\\n    }\\n};\"}");

        // Binary Tree problems
        PracticeProblem maxDepthBinaryTree = new PracticeProblem(
            "Maximum Depth of Binary Tree",
            "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
            "easy",
            "binary-tree"
        );
        maxDepthBinaryTree.setTestCases(objectMapper.readValue("[{\"input\":[3,9,20,null,null,15,7],\"output\":3},{\"input\":[1,null,2],\"output\":2}]", new TypeReference<List<Map<String, Object>>>() {}));
        maxDepthBinaryTree.setSolution("public int maxDepth(TreeNode root) {\n    if (root == null) {\n        return 0;\n    }\n    int leftDepth = maxDepth(root.left);\n    int rightDepth = maxDepth(root.right);\n    return Math.max(leftDepth, rightDepth) + 1;\n}");
        maxDepthBinaryTree.setBoilerPlateCode("{\"java\":\"/**\\n * Definition for a binary tree node.\\n * public class TreeNode {\\n *     int val;\\n *     TreeNode left;\\n *     TreeNode right;\\n *     TreeNode() {}\\n *     TreeNode(int val) { this.val = val; }\\n *     TreeNode(int val, TreeNode left, TreeNode right) {\\n *         this.val = val;\\n *         this.left = left;\\n *         this.right = right;\\n *     }\\n * }\\n */\\nclass Solution {\\n    public int maxDepth(TreeNode root) {\\n        // Your code here\\n    }\\n}\",\"javascript\":\"/**\\n * Definition for a binary tree node.\\n * function TreeNode(val, left, right) {\\n *     this.val = (val===undefined ? 0 : val)\\n *     this.left = (left===undefined ? null : left)\\n *     this.right = (right===undefined ? null : right)\\n * }\\n */\\n/**\\n * @param {TreeNode} root\\n * @return {number}\\n */\\nvar maxDepth = function(root) {\\n    // Your code here\\n};\",\"python\":\"# Definition for a binary tree node.\\n# class TreeNode:\\n#     def __init__(self, val=0, left=None, right=None):\\n#         self.val = val\\n#         self.left = left\\n#         self.right = right\\nclass Solution:\\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\\n        # Your code here\\n        pass\",\"cpp\":\"/**\\n * Definition for a binary tree node.\\n * struct TreeNode {\\n *     int val;\\n *     TreeNode *left;\\n *     TreeNode *right;\\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {\\n * };\\n */\\nclass Solution {\\npublic:\\n    int maxDepth(TreeNode* root) {\\n        // Your code here\\n    }\\n};\"}");

        PracticeProblem levelOrderTraversal = new PracticeProblem(
            "Binary Tree Level Order Traversal",
            "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
            "medium",
            "binary-tree"
        );
        levelOrderTraversal.setTestCases(objectMapper.readValue("[{\"input\":[3,9,20,null,null,15,7],\"output\":[[3],[9,20],[15,7]]},{\"input\":[1],\"output\":[[1]]},{\"input\":[],\"output\":[]}]", new TypeReference<List<Map<String, Object>>>() {}));
        levelOrderTraversal.setSolution("public List<List<Integer>> levelOrder(TreeNode root) {\n    List<List<Integer>> result = new ArrayList<>();\n    if (root == null) return result;\n    \n    Queue<TreeNode> queue = new LinkedList<>();\n    queue.offer(root);\n    \n    while (!queue.isEmpty()) {\n        int levelSize = queue.size();\n        List<Integer> currentLevel = new ArrayList<>();\n        \n        for (int i = 0; i < levelSize; i++) {\n            TreeNode node = queue.poll();\n            currentLevel.add(node.val);\n            \n            if (node.left != null) queue.offer(node.left);\n            if (node.right != null) queue.offer(node.right);\n        }\n        \n        result.add(currentLevel);\n    }\n    \n    return result;\n}");
        levelOrderTraversal.setBoilerPlateCode("{\"java\":\"/**\\n * Definition for a binary tree node.\\n * public class TreeNode {\\n *     int val;\\n *     TreeNode left;\\n *     TreeNode right;\\n *     TreeNode() {}\\n *     TreeNode(int val) { this.val = val; }\\n *     TreeNode(int val, TreeNode left, TreeNode right) {\\n *         this.val = val;\\n *         this.left = left;\\n *         this.right = right;\\n *     }\\n * }\\n */\\nclass Solution {\\n    public List<List<Integer>> levelOrder(TreeNode root) {\\n        // Your code here\\n    }\\n}\",\"javascript\":\"/**\\n * Definition for a binary tree node.\\n * function TreeNode(val, left, right) {\\n *     this.val = (val===undefined ? 0 : val)\\n *     this.left = (left===undefined ? null : left)\\n *     this.right = (right===undefined ? null : right)\\n * }\\n */\\n/**\\n * @param {TreeNode} root\\n * @return {number[][]}\\n */\\nvar levelOrder = function(root) {\\n    // Your code here\\n};\",\"python\":\"# Definition for a binary tree node.\\n# class TreeNode:\\n#     def __init__(self, val=0, left=None, right=None):\\n#         self.val = val\\n#         self.left = left\\n#         self.right = right\\nclass Solution:\\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\\n        # Your code here\\n        pass\",\"cpp\":\"/**\\n * Definition for a binary tree node.\\n * struct TreeNode {\\n *     int val;\\n *     TreeNode *left;\\n *     TreeNode *right;\\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {\\n * };\\n */\\nclass Solution {\\npublic:\\n    vector<vector<int>> levelOrder(TreeNode* root) {\\n        // Your code here\\n    }\\n};\"}");

        // Linked List problems
        PracticeProblem reverseLinkedList = new PracticeProblem(
            "Reverse Linked List",
            "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            "easy",
            "linked-list"
        );
        reverseLinkedList.setMethodName("reverseList");
        reverseLinkedList.setTestCases(objectMapper.readValue("[{\"input\":[1,2,3,4,5],\"output\":[5,4,3,2,1]},{\"input\":[1,2],\"output\":[2,1]},{\"input\":[],\"output\":[]}]", new TypeReference<List<Map<String, Object>>>() {}));
        reverseLinkedList.setSolution("public ListNode reverseList(ListNode head) { ListNode prev = null; ListNode curr = head; while (curr != null) { ListNode nextTemp = curr.next; curr.next = prev; prev = curr; curr = nextTemp; } return prev; }");
        reverseLinkedList.setBoilerPlateCode("{\"java\":\"/**\\n * Definition for singly-linked list.\\n * public class ListNode {\\n *     int val;\\n *     ListNode next;\\n *     ListNode() {}\\n *     ListNode(int val) { this.val = val; }\\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\\n * }\\n */\\nclass Solution {\\n    public ListNode reverseList(ListNode head) {\\n        // Your code here\\n    }\\n}\",\"javascript\":\"/**\\n * Definition for singly-linked list.\\n * function ListNode(val, next) {\\n *     this.val = (val===undefined ? 0 : val)\\n *     this.next = (next===undefined ? null : next)\\n * }\\n */\\n/**\\n * @param {ListNode} head\\n * @return {ListNode}\\n */\\nvar reverseList = function(head) {\\n    // Your code here\\n};\",\"python\":\"# Definition for singly-linked list.\\n# class ListNode:\\n#     def __init__(self, val=0, next=None):\\n#         self.val = val\\n#         self.next = next\\nclass Solution:\\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\\n        # Your code here\\n        pass\",\"cpp\":\"/**\\n * Definition for singly-linked list.\\n * struct ListNode {\\n *     int val;\\n *     ListNode *next;\\n *     ListNode() : val(0), next(nullptr) {}\\n *     ListNode(int x) : val(x), next(nullptr) {\\n *     ListNode(int x, ListNode *next) : val(x), next(next) {\\n * };\\n */\\nclass Solution {\\npublic:\\n    ListNode* reverseList(ListNode* head) {\\n        // Your code here\\n    }\\n};\"}");

        PracticeProblem findDuplicateNumber = new PracticeProblem(
            "Find the Duplicate Number",
            "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.\n\nThere is only one repeated number in nums, return this repeated number.\n\nYou must solve the problem without modifying the array nums and uses only constant extra space.",
            "medium",
            "linked-list"
        );
        findDuplicateNumber.setMethodName("findDuplicate");
        findDuplicateNumber.setTestCases(objectMapper.readValue("[{\"input\":[1,3,4,2,2],\"output\":2},{\"input\":[3,1,3,4,2],\"output\":3},{\"input\":[1,1],\"output\":1}]", new TypeReference<List<Map<String, Object>>>() {}));
        findDuplicateNumber.setSolution("public int findDuplicate(int[] nums) {\n    // Floyd's Tortoise and Hare (Cycle Detection)\n    int slow = nums[0];\n    int fast = nums[0];\n    \n    // Find the intersection point of the two runners\n    do {\n        slow = nums[slow];\n        fast = nums[nums[fast]];\n    } while (slow != fast);\n    \n    // Find the entrance to the cycle\n    slow = nums[0];\n    while (slow != fast) {\n        slow = nums[slow];\n        fast = nums[fast];\n    }\n    \n    return slow;\n}");

        // Save all problems to the database
        practiceProblemRepository.save(validParentheses);
        practiceProblemRepository.save(minStack);
        practiceProblemRepository.save(implementQueue);
        practiceProblemRepository.save(maxDepthBinaryTree);
        practiceProblemRepository.save(levelOrderTraversal);
        practiceProblemRepository.save(reverseLinkedList);
        practiceProblemRepository.save(findDuplicateNumber);
    }
}