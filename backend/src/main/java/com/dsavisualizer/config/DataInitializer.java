package com.dsavisualizer.config;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.repository.PracticeProblemRepository;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PracticeProblemRepository practiceProblemRepository;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    

    


    public DataInitializer(PracticeProblemRepository practiceProblemRepository, ObjectMapper objectMapper, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.practiceProblemRepository = practiceProblemRepository;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
                """
Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.
                """,
                "easy",
                "stack"
        );
        validParentheses.setMethodName("isValid");
        validParentheses.setTestCases(objectMapper.readValue("[{\"input\":\"()\",\"output\":true},{\"input\":\"()[]{}\",\"output\":true},{\"input\":\"(]\",\"output\":false},{\"input\":\"([)]\",\"output\":false},{\"input\":\"{[]}\",\"output\":true}]", new TypeReference<List<Map<String, Object>>>() {
        }));
        
        // Solutions for different languages
        Map<String, String> solutions = new HashMap<>();
        
        // Java solution
        solutions.put("java", "public boolean isValid(String s) {\n    Stack<Character> stack = new Stack<>();\n    for (char c : s.toCharArray()) {\n        if (c == '(' || c == '{' || c == '[') {\n            stack.push(c);\n        } else {\n            if (stack.isEmpty()) return false;\n            char top = stack.pop();\n            if ((c == ')' && top != '(') || \n                (c == '}' && top != '{') || \n                (c == ']' && top != '[')) {\n                return false;\n            }\n        }\n    }\n    return stack.isEmpty();\n}");
        
        // JavaScript solution
        solutions.put("javascript", "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    const stack = [];\n    const map = {\n        ')': '(',\n        '}': '{',\n        ']': '['\n    };\n    \n    for (let char of s) {\n        if (!(char in map)) {\n            stack.push(char);\n        } else if (stack.length === 0 || stack.pop() !== map[char]) {\n            return false;\n        }\n    }\n    return stack.length === 0;\n}");
        
        // Python solution
        solutions.put("python", "def isValid(self, s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    \n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack");
            
        // C++ solution
        solutions.put("cpp", "bool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{' || c == '[') {\n            st.push(c);\n        } else {\n            if (st.empty()) return false;\n            char top = st.top();\n            st.pop();\n            if ((c == ')' && top != '(') || \n                (c == '}' && top != '{') || \n                (c == ']' && top != '[')) {\n                return false;\n            }\n        }\n    }\n    return st.empty();\n}");
        
        // Set solutions and complexities
        setupProblemSolutions(validParentheses, solutions, "O(n)", "O(n)");
        
        // Set boilerplate code
        validParentheses.setBoilerPlateCode("""
                    {
                        "java":"class Solution {\\n    public boolean isValid(String s) {\\n        // Your code here\\n    }\\n}",
                        "javascript":"class Solution {\\n    /**\\n     * @param {string} s\\n     * @return {boolean}\\n     */\\n    isValid(s) {\\n        // Your code here\\n    }\\n}",
                        "python":"class Solution:\\n    def isValid(self, s: str) -> bool:\\n        # Your code here\\n        pass",
                        "cpp":"class Solution {\\npublic:\\n    bool isValid(string s) {\\n        // Your code here\\n    }\\n};"
                    }
                """);


        PracticeProblem minStack = new PracticeProblem(
                "Min Stack",
                """
Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

Implement the MinStack class with the following operations:
- `MinStack()`: Initializes the stack object.
- `push(val)`: Pushes the element val onto the stack.
- `pop()`: Removes the element on the top of the stack.
- `top()`: Gets the top element of the stack.
- `getMin()`: Retrieves the minimum element in the stack.

**Constraints:**
- You must implement a solution with O(1) time complexity for each function.
                """,
                "medium",
                "stack"
        );
        minStack.setMethodName("MinStack");
        minStack.setTestCases(objectMapper.readValue("[{\"input\":[\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"],\"inputArgs\":[[],[-2],[0],[-3],[],[],[],[]],\"output\":[null,null,null,null,-3,null,0,-2]}]", new TypeReference<List<Map<String, Object>>>() {
        }));
        
        // Solutions for different languages
        Map<String, String> minStackSolutions = createSolutionMap(
            // Java solution
            "class MinStack {\n" +
            "    private Stack<Integer> stack;\n" +
            "    private Stack<Integer> minStack;\n\n" +
            "    public MinStack() {\n" +
            "        stack = new Stack<>();\n" +
            "        minStack = new Stack<>();\n" +
            "    }\n" +
            "    \n" +
            "    public void push(int val) {\n" +
            "        stack.push(val);\n" +
            "        if (minStack.isEmpty() || val <= minStack.peek()) {\n" +
            "            minStack.push(val);\n" +
            "        } else {\n" +
            "            minStack.push(minStack.peek());\n" +
            "        }\n" +
            "    }\n" +
            "    \n" +
            "    public void pop() {\n" +
            "        stack.pop();\n" +
            "        minStack.pop();\n" +
            "    }\n" +
            "    \n" +
            "    public int top() {\n" +
            "        return stack.peek();\n" +
            "    }\n" +
            "    \n" +
            "    public int getMin() {\n" +
            "        return minStack.peek();\n" +
            "    }\n" +
            "}",

            // JavaScript solution
            "class MinStack {\n" +
            "    constructor() {\n" +
            "        this.stack = [];\n" +
            "        this.minStack = [];\n" +
            "    }\n" +
            "    \n" +
            "    push(val) {\n" +
            "        this.stack.push(val);\n" +
            "        if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {\n" +
            "            this.minStack.push(val);\n" +
            "        } else {\n" +
            "            this.minStack.push(this.minStack[this.minStack.length - 1]);\n" +
            "        }\n" +
            "    }\n" +
            "    \n" +
            "    pop() {\n" +
            "        this.stack.pop();\n" +
            "        this.minStack.pop();\n" +
            "    }\n" +
            "    \n" +
            "    top() {\n" +
            "        return this.stack[this.stack.length - 1];\n" +
            "    }\n" +
            "    \n" +
            "    getMin() {\n" +
            "        return this.minStack[this.minStack.length - 1];\n" +
            "    }\n" +
            "}",
            
            // Python solution
            "class MinStack:\n" +
            "    def __init__(self):\n" +
            "        self.stack = []\n" +
            "        self.min_stack = []\n" +
            "    \n" +
            "    def push(self, val: int) -> None:\n" +
            "        self.stack.append(val)\n" +
            "        if not self.min_stack or val <= self.min_stack[-1]:\n" +
            "            self.min_stack.append(val)\n" +
            "        else:\n" +
            "            self.min_stack.append(self.min_stack[-1])\n" +
            "    \n" +
            "    def pop(self) -> None:\n" +
            "        self.stack.pop()\n" +
            "        self.min_stack.pop()\n" +
            "    \n" +
            "    def top(self) -> int:\n" +
            "        return self.stack[-1]\n" +
            "    \n" +
            "    def getMin(self) -> int:\n" +
            "        return self.min_stack[-1]",
            
            // C++ solution
            "class MinStack {\n" +
            "private:\n" +
            "    stack<int> data;\n" +
            "    stack<int> min_stack;\n" +
            "    \n" +
            "public:\n" +
            "    MinStack() {\n" +
            "        \n" +
            "    }\n" +
            "    \n" +
            "    void push(int val) {\n" +
            "        data.push(val);\n" +
            "        if (min_stack.empty() || val <= min_stack.top()) {\n" +
            "            min_stack.push(val);\n" +
            "        } else {\n" +
            "            min_stack.push(min_stack.top());\n" +
            "        }\n" +
            "    }\n" +
            "    \n" +
            "    void pop() {\n" +
            "        data.pop();\n" +
            "        min_stack.pop();\n" +
            "    }\n" +
            "    \n" +
            "    int top() {\n" +
            "        return data.top();\n" +
            "    }\n" +
            "    \n" +
            "    int getMin() {\n" +
            "        return min_stack.top();\n" +
            "    }\n" +
            "};"
        );
        
        // Set solutions and complexities
        setupProblemSolutions(minStack, minStackSolutions, "O(1) for all operations", "O(n)");
        minStack.setBoilerPlateCode(
            "{" +
            "\"java\": \"class MinStack {\\n    public MinStack() {\\n        // Your code here\\n    }\\n    public void push(int val) {\\n        // Your code here\\n    }\\n    public void pop() {\\n        // Your code here\\n    }\\n    public int top() {\\n        // Your code here\\n    }\\n    public int getMin() {\\n        // Your code here\\n    }\\n}\"," +
            "\"javascript\": \"class MinStack {\\n  constructor() {\\n    // Your code here\\n  }\\n  push(val) {\\n    // Your code here\\n  }\\n  pop() {\\n    // Your code here\\n  }\\n  top() {\\n    // Your code here\\n  }\\n  getMin() {\\n    // Your code here\\n  }\\n}\"," +
            "\"python\": \"class MinStack:\\n    def __init__(self):\\n        # Your code here\\n        pass\\n    def push(self, val: int) -> None:\\n        # Your code here\\n        pass\\n    def pop(self) -> None:\\n        # Your code here\\n        pass\\n    def top(self) -> int:\\n        # Your code here\\n        pass\\n    def getMin(self) -> int:\\n        # Your code here\\n        pass\"," +
            "\"cpp\": \"class MinStack {\\npublic:\\n    MinStack() {\\n        // Your code here\\n    }\\n    void push(int val) { /* Your code here */ }\\n    void pop() { /* Your code here */ }\\n    int top() { /* Your code here */ }\\n    int getMin() { /* Your code here */ }\\n};\"" +
            "}"
        );
            
        // Queue problems
        PracticeProblem implementQueue = new PracticeProblem(
                "Implement Queue using Stacks",
                """
Implement a first in first out (FIFO) queue using only two stacks.

The implemented queue should support all the functions of a normal queue:
- `push(x)`: Pushes element x to the back of the queue.
- `pop()`: Removes the element from the front of the queue and returns it.
- `peek()`: Returns the element at the front of the queue.
- `empty()`: Returns true if the queue is empty, false otherwise.

**Constraints:**
- You must use only standard operations of a stack, which means only push to top, peek/pop from top, size, and isEmpty operations are valid.
                """,
                "easy",
                "queue"
        );
        implementQueue.setTestCases(objectMapper.readValue("[{\"input\":[\"MyQueue\",\"push\",\"push\",\"peek\",\"pop\",\"empty\"],\"inputArgs\":[[],[1],[2],[],[],[]],\"output\":[null,null,null,1,1,false]}]", new TypeReference<List<Map<String, Object>>>() {
        }));
        
        // Create solutions map
        Map<String, String> queueSolutions = new HashMap<>();
        
        // Java solution
        queueSolutions.put("java", 
            "class MyQueue {\n" +
            "    private Stack<Integer> input;\n" +
            "    private Stack<Integer> output;\n\n" +
            "    public MyQueue() {\n" +
            "        input = new Stack<>();\n" +
            "        output = new Stack<>();\n" +
            "    }\n    \n" +
            "    public void push(int x) {\n" +
            "        input.push(x);\n" +
            "    }\n    \n" +
            "    public int pop() {\n" +
            "        peek();\n" +
            "        return output.pop();\n" +
            "    }\n    \n" +
            "    public int peek() {\n" +
            "        if (output.isEmpty()) {\n" +
            "            while (!input.isEmpty()) {\n" +
            "                output.push(input.pop());\n" +
            "            }\n" +
            "        }\n" +
            "        return output.peek();\n" +
            "    }\n    \n" +
            "    public boolean empty() {\n" +
            "        return input.isEmpty() && output.isEmpty();\n" +
            "    }\n" +
            "}"
        );
        
        // JavaScript solution
        queueSolutions.put("javascript",
            "class MyQueue {\n" +
            "    constructor() {\n" +
            "        this.input = [];\n" +
            "        this.output = [];\n" +
            "    }\n\n" +
            "    push(x) {\n" +
            "        this.input.push(x);\n" +
            "    }\n\n" +
            "    pop() {\n" +
            "        this.peek();\n" +
            "        return this.output.pop();\n" +
            "    }\n\n" +
            "    peek() {\n" +
            "        if (this.output.length === 0) {\n" +
            "            while (this.input.length > 0) {\n" +
            "                this.output.push(this.input.pop());\n" +
            "            }\n" +
            "        }\n" +
            "        return this.output[this.output.length - 1];\n" +
            "    }\n\n" +
            "    empty() {\n" +
            "        return this.input.length === 0 && this.output.length === 0;\n" +
            "    }\n" +
            "}"
        );
        
        // Python solution
        queueSolutions.put("python",
            "class MyQueue:\n\n" +
            "    def __init__(self):\n" +
            "        self.input = []\n" +
            "        self.output = []\n\n" +
            "    def push(self, x: int) -> None:\n" +
            "        self.input.append(x)\n\n" +
            "    def pop(self) -> int:\n" +
            "        self.peek()\n" +
            "        return self.output.pop()\n\n" +
            "    def peek(self) -> int:\n" +
            "        if not self.output:\n" +
            "            while self.input:\n" +
            "                self.output.append(self.input.pop())\n" +
            "        return self.output[-1]\n\n" +
            "    def empty(self) -> bool:\n" +
            "        return not self.input and not self.output"
        );
        
        // C++ solution
        queueSolutions.put("cpp",
            "class MyQueue {\n" +
            "private:\n" +
            "    stack<int> input, output;\n\n" +
            "public:\n" +
            "    MyQueue() {\n" +
            "        \n" +
            "    }\n\n" +
            "    void push(int x) {\n" +
            "        input.push(x);\n" +
            "    }\n\n" +
            "    int pop() {\n" +
            "        int val = peek();\n" +
            "        output.pop();\n" +
            "        return val;\n" +
            "    }\n\n" +
            "    int peek() {\n" +
            "        if (output.empty()) {\n" +
            "            while (!input.empty()) {\n" +
            "                output.push(input.top());\n" +
            "                input.pop();\n" +
            "            }\n" +
            "        }\n" +
            "        return output.top();\n" +
            "    }\n\n" +
            "    bool empty() {\n" +
            "        return input.empty() && output.empty();\n" +
            "    }\n" +
            "};"
        );
        
        // Set up solutions and complexities
        setupProblemSolutions(implementQueue, queueSolutions, "O(1) amortized", "O(n)");
        
        // Set boilerplate code
        implementQueue.setBoilerPlateCode(
            "{" +
            "\"java\": \"class MyQueue {\\n    public MyQueue() {\\n        // Your code here\\n    }\\n    public void push(int x) {\\n        // Your code here\\n    }\\n    public int pop() {\\n        // Your code here\\n    }\\n    public int peek() {\\n        // Your code here\\n    }\\n    public boolean empty() {\\n        // Your code here\\n    }\\n}\"," +
            "\"javascript\": \"class MyQueue {\\n  constructor() {\\n    // Your code here\\n  }\\n  push(x) {\\n    // Your code here\\n  }\\n  pop() {\\n    // Your code here\\n  }\\n  peek() {\\n    // Your code here\\n  }\\n  empty() {\\n    // Your code here\\n  }\\n}\"," +
            "\"python\": \"class MyQueue:\\n    def __init__(self):\\n        # Your code here\\n        pass\\n    def push(self, x: int) -> None:\\n        # Your code here\\n        pass\\n    def pop(self) -> int:\\n        # Your code here\\n        pass\\n    def peek(self) -> int:\\n        # Your code here\\n        pass\\n    def empty(self) -> bool:\\n        # Your code here\\n        pass\"," +
            "\"cpp\": \"class MyQueue {\\npublic:\\n    MyQueue() {\\n        // Your code here\\n    }\\n    void push(int x) { /* Your code here */ }\\n    int pop() { /* Your code here */ }\\n    int peek() { /* Your code here */ }\\n    bool empty() { /* Your code here */ }\\n};\"" +
            "}"
        );
        // Binary Tree problems
        PracticeProblem maxDepthBinaryTree = new PracticeProblem(
                "Maximum Depth of Binary Tree",
                """
Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.
                """,
                "easy",
                "binary-tree"
        );
        maxDepthBinaryTree.setTestCases(objectMapper.readValue(
            "[{\"input\":[3,9,20,null,null,15,7],\"output\":3},{\"input\":[1,null,2],\"output\":2}]", 
            new TypeReference<List<Map<String, Object>>>() {})
        );
        
        // Create solutions map
        Map<String, String> maxDepthSolutions = new HashMap<>();
        
        // Java solution
        maxDepthSolutions.put("java", 
            "public int maxDepth(TreeNode root) {\n" +
            "    if (root == null) {\n" +
            "        return 0;\n" +
            "    }\n" +
            "    int leftDepth = maxDepth(root.left);\n" +
            "    int rightDepth = maxDepth(root.right);\n" +
            "    return Math.max(leftDepth, rightDepth) + 1;\n" +
            "}"
        );
        
        // JavaScript solution
        maxDepthSolutions.put("javascript",
            "/**\n * @param {TreeNode} root\n * @return {number}\n */\n" +
            "function maxDepth(root) {\n" +
            "    if (!root) return 0;\n" +
            "    const leftDepth = maxDepth(root.left);\n" +
            "    const rightDepth = maxDepth(root.right);\n" +
            "    return Math.max(leftDepth, rightDepth) + 1;\n" +
            "}"
        );
        
        // Python solution
        maxDepthSolutions.put("python",
            "def maxDepth(self, root: Optional[TreeNode]) -> int:\n" +
            "    if not root:\n" +
            "        return 0\n" +
            "    left_depth = self.maxDepth(root.left)\n" +
            "    right_depth = self.maxDepth(root.right)\n" +
            "    return max(left_depth, right_depth) + 1"
        );
        
        // C++ solution
        maxDepthSolutions.put("cpp",
            "class Solution {\n" +
            "public:\n" +
            "    int maxDepth(TreeNode* root) {\n" +
            "        if (!root) return 0;\n" +
            "        int left = maxDepth(root->left);\n" +
            "        int right = maxDepth(root->right);\n" +
            "        return max(left, right) + 1;\n" +
            "    }\n" +
            "};"
        );
        
        // Set up solutions and complexities
        setupProblemSolutions(maxDepthBinaryTree, maxDepthSolutions, "O(n)", "O(n) in worst case, O(log n) on average");
        
        // Set boilerplate code using text block for cleaner JSON
        String boilerplate = """
        {
          "java": "class Solution {\\n    public int maxDepth(TreeNode root) {\\n        // Your code here\\n    }\\n}",
          "javascript": "class Solution {\\n    /**\\n     * @param {TreeNode} root\\n     * @return {number}\\n     */\\n    maxDepth(root) {\\n        // Your code here\\n    }\\n}",
          "python": "class Solution:\\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\\n        # Your code here\\n        pass",
          "cpp": "class Solution {\\npublic:\\n    int maxDepth(TreeNode* root) {\\n        // Your code here\\n    }\\n};"
        }
        """;
        
        maxDepthBinaryTree.setBoilerPlateCode(boilerplate);

        PracticeProblem levelOrderTraversal = new PracticeProblem(
                "Binary Tree Level Order Traversal",
                """
Given the root of a binary tree, return the level order traversal of its nodes' values.

(i.e., from left to right, level by level).
                """,
                "medium",
                "binary-tree"
        );
        levelOrderTraversal.setTestCases(objectMapper.readValue(
            "[{\"input\":[3,9,20,null,null,15,7],\"output\":[[3],[9,20],[15,7]]},{\"input\":[1],\"output\":[[1]]},{\"input\":[],\"output\":[]}]", 
            new TypeReference<List<Map<String, Object>>>() {})
        );
        
        // Create solutions map
        Map<String, String> levelOrderSolutions = new HashMap<>();
        
        // Java solution
        levelOrderSolutions.put("java", 
            "public List<List<Integer>> levelOrder(TreeNode root) {\n" +
            "    List<List<Integer>> result = new ArrayList<>();\n" +
            "    if (root == null) return result;\n\n" +
            "    Queue<TreeNode> queue = new LinkedList<>();\n" +
            "    queue.offer(root);\n\n" +
            "    while (!queue.isEmpty()) {\n" +
            "        int levelSize = queue.size();\n" +
            "        List<Integer> currentLevel = new ArrayList<>();\n\n" +
            "        for (int i = 0; i < levelSize; i++) {\n" +
            "            TreeNode node = queue.poll();\n" +
            "            currentLevel.add(node.val);\n\n" +
            "            if (node.left != null) queue.offer(node.left);\n" +
            "            if (node.right != null) queue.offer(node.right);\n" +
            "        }\n\n" +
            "        result.add(currentLevel);\n" +
            "    }\n\n" +
            "    return result;\n" +
            "}"
        );
        
        // JavaScript solution
        levelOrderSolutions.put("javascript",
            "/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\n" +
            "function levelOrder(root) {\n" +
            "    if (!root) return [];\n" +
            "    \n" +
            "    const result = [];\n" +
            "    const queue = [root];\n" +
            "    \n" +
            "    while (queue.length > 0) {\n" +
            "        const levelSize = queue.length;\n" +
            "        const currentLevel = [];\n" +
            "        \n" +
            "        for (let i = 0; i < levelSize; i++) {\n" +
            "            const node = queue.shift();\n" +
            "            currentLevel.push(node.val);\n" +
            "            \n" +
            "            if (node.left) queue.push(node.left);\n" +
            "            if (node.right) queue.push(node.right);\n" +
            "        }\n" +
            "        \n" +
            "        result.push(currentLevel);\n" +
            "    }\n" +
            "    \n" +
            "    return result;\n" +
            "}"
        );
        
        // Python solution
        levelOrderSolutions.put("python",
            "def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n" +
            "    if not root:\n" +
            "        return []\n" +
            "    \n" +
            "    result = []\n" +
            "    queue = collections.deque([root])\n" +
            "    \n" +
            "    while queue:\n" +
            "        level_size = len(queue)\n" +
            "        current_level = []\n" +
            "        \n" +
            "        for _ in range(level_size):\n" +
            "            node = queue.popleft()\n" +
            "            current_level.append(node.val)\n" +
            "            \n" +
            "            if node.left:\n" +
            "                queue.append(node.left)\n" +
            "            if node.right:\n" +
            "                queue.append(node.right)\n" +
            "        \n" +
            "        result.append(current_level)\n" +
            "    \n" +
            "    return result"
        );
        
        // C++ solution
        levelOrderSolutions.put("cpp",
            "class Solution {\n" +
            "public:\n" +
            "    vector<vector<int>> levelOrder(TreeNode* root) {\n" +
            "        vector<vector<int>> result;\n" +
            "        if (!root) return result;\n\n" +
            "        queue<TreeNode*> q;\n" +
            "        q.push(root);\n\n" +
            "        while (!q.empty()) {\n" +
            "            int levelSize = q.size();\n" +
            "            vector<int> currentLevel;\n\n" +
            "            for (int i = 0; i < levelSize; i++) {\n" +
            "                TreeNode* node = q.front();\n" +
            "                q.pop();\n" +
            "                currentLevel.push_back(node->val);\n\n" +
            "                if (node->left) q.push(node->left);\n" +
            "                if (node->right) q.push(node->right);\n" +
            "            }\n\n" +
            "            result.push_back(currentLevel);\n" +
            "        }\n\n" +
            "        return result;\n" +
            "    }\n" +
            "};"
        );
        
        // Set up solutions and complexities
        setupProblemSolutions(levelOrderTraversal, levelOrderSolutions, "O(n)", "O(n)");
        
        // Set boilerplate code using text block for cleaner JSON
        levelOrderTraversal.setBoilerPlateCode("""
                {
                  "java": "class Solution {\\n    public List<List<Integer>> levelOrder(TreeNode root) {\\n        // Your code here\\n    }\\n}",
                  "javascript": "class Solution {\\n    /**\\n     * @param {TreeNode} root\\n     * @return {number[][]}\\n     */\\n    levelOrder(root) {\\n        // Your code here\\n    }\\n}",
                  "python": "class Solution:\\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\\n        # Your code here\\n        pass",
                  "cpp": "class Solution {\\npublic:\\n    vector<vector<int>> levelOrder(TreeNode* root) {\\n        // Your code here\\n    }\\n};"
                }
                """);
        // Linked List problems
        PracticeProblem reverseLinkedList = new PracticeProblem(
                "Reverse Linked List",
                """
Given the head of a singly linked list, reverse the list, and return the reversed list.
                """,
                "easy",
                "linked-list"
        );
        reverseLinkedList.setMethodName("reverseList");
        reverseLinkedList.setTestCases(objectMapper.readValue(
            "[{\"input\":[1,2,3,4,5],\"output\":[5,4,3,2,1]},{\"input\":[1,2],\"output\":[2,1]},{\"input\":[],\"output\":[]}]", 
            new TypeReference<List<Map<String, Object>>>() {})
        );
        
        // Create solutions map
        Map<String, String> reverseListSolutions = new HashMap<>();
        
        // Java solution
        reverseListSolutions.put("java", 
            "public ListNode reverseList(ListNode head) {\n" +
            "    ListNode prev = null;\n" +
            "    ListNode curr = head;\n" +
            "    \n" +
            "    while (curr != null) {\n" +
            "        ListNode nextTemp = curr.next;\n" +
            "        curr.next = prev;\n" +
            "        prev = curr;\n" +
            "        curr = nextTemp;\n" +
            "    }\n" +
            "    \n" +
            "    return prev;\n" +
            "}"
        );
        
        // JavaScript solution
        reverseListSolutions.put("javascript",
            "/**\n * @param {ListNode} head\n * @return {ListNode}\n */\n" +
            "function reverseList(head) {\n" +
            "    let prev = null;\n" +
            "    let curr = head;\n" +
            "    \n" +
            "    while (curr !== null) {\n" +
            "        const nextTemp = curr.next;\n" +
            "        curr.next = prev;\n" +
            "        prev = curr;\n" +
            "        curr = nextTemp;\n" +
            "    }\n" +
            "    \n" +
            "    return prev;\n" +
            "}"
        );
        
        // Python solution
        reverseListSolutions.put("python",
            "def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n" +
            "    prev = None\n" +
            "    curr = head\n" +
            "    \n" +
            "    while curr:\n" +
            "        next_temp = curr.next\n" +
            "        curr.next = prev\n" +
            "        prev = curr\n" +
            "        curr = next_temp\n" +
            "    \n" +
            "    return prev"
        );
        
        // C++ solution
        reverseListSolutions.put("cpp",
            "class Solution {\n" +
            "public:\n" +
            "    ListNode* reverseList(ListNode* head) {\n" +
            "        ListNode* prev = nullptr;\n" +
            "        ListNode* curr = head;\n" +
            "        \n" +
            "        while (curr != nullptr) {\n" +
            "            ListNode* nextTemp = curr->next;\n" +
            "            curr->next = prev;\n" +
            "            prev = curr;\n" +
            "            curr = nextTemp;\n" +
            "        }\n" +
            "        \n" +
            "        return prev;\n" +
            "    }\n" +
            "};"
        );
        
        // Set up solutions and complexities
        setupProblemSolutions(reverseLinkedList, reverseListSolutions, "O(n)", "O(1)");
        
        // Set boilerplate code using text block for cleaner JSON
        reverseLinkedList.setBoilerPlateCode("""
                {
                  "java": "class Solution {\\n    public ListNode reverseList(ListNode head) {\\n        // Your code here\\n    }\\n}",
                  "javascript": "class Solution {\\n    /**\\n     * @param {ListNode} head\\n     * @return {ListNode}\\n     */\\n    reverseList(head) {\\n        // Your code here\\n    }\\n}",
                  "python": "class Solution:\\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\\n        # Your code here\\n        pass",
                  "cpp": "class Solution {\\npublic:\\n    ListNode* reverseList(ListNode* head) {\\n        // Your code here\\n    }\\n};"
                }
                """);


        // Find the Duplicate Number (Floyd's Tortoise and Hare algorithm)
        PracticeProblem findDuplicateNumber = new PracticeProblem(
                "Find the Duplicate Number",
                """
Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.

There is only one repeated number in nums, return this repeated number.

**Constraints:**
- You must solve the problem without modifying the array nums and use only constant extra space.
                """,
                "medium",
                "linked-list"
        );
        findDuplicateNumber.setMethodName("findDuplicate");
        findDuplicateNumber.setTestCases(objectMapper.readValue(
            "[{\"input\":[1,3,4,2,2],\"output\":2},{\"input\":[3,1,3,4,2],\"output\":3},{\"input\":[1,1],\"output\":1}]", 
            new TypeReference<List<Map<String, Object>>>() {})
        );
        
        // Create solutions map
        Map<String, String> findDuplicateSolutions = new HashMap<>();
        
        // Java solution
        findDuplicateSolutions.put("java", 
            "public int findDuplicate(int[] nums) {\n" +
            "    // Floyd's Tortoise and Hare algorithm\n" +
            "    int slow = nums[0];\n" +
            "    int fast = nums[0];\n" +
            "    \n" +
            "    // Find the intersection point of the two runners\n" +
            "    do {\n" +
            "        slow = nums[slow];\n" +
            "        fast = nums[nums[fast]];\n" +
            "    } while (slow != fast);\n" +
            "    \n" +
            "    // Find the entrance to the cycle\n" +
            "    slow = nums[0];\n" +
            "    while (slow != fast) {\n" +
            "        slow = nums[slow];\n" +
            "        fast = nums[fast];\n" +
            "    }\n" +
            "    \n" +
            "    return slow;\n" +
            "}"
        );
        
        // JavaScript solution
        findDuplicateSolutions.put("javascript",
            "/**\n * @param {number[]} nums\n * @return {number}\n */\n" +
            "function findDuplicate(nums) {\n" +
            "    // Floyd's Tortoise and Hare algorithm\n" +
            "    let slow = nums[0];\n" +
            "    let fast = nums[0];\n" +
            "    \n" +
            "    // Find the intersection point of the two runners\n" +
            "    do {\n" +
            "        slow = nums[slow];\n" +
            "        fast = nums[nums[fast]];\n" +
            "    } while (slow !== fast);\n" +
            "    \n" +
            "    // Find the entrance to the cycle\n" +
            "    slow = nums[0];\n" +
            "    while (slow !== fast) {\n" +
            "        slow = nums[slow];\n" +
            "        fast = nums[fast];\n" +
            "    }\n" +
            "    \n" +
            "    return slow;\n" +
            "}"
        );
        
        // Python solution
        findDuplicateSolutions.put("python",
            "def findDuplicate(self, nums: List[int]) -> int:\n" +
            "    # Floyd's Tortoise and Hare algorithm\n" +
            "    slow = nums[0]\n" +
            "    fast = nums[0]\n" +
            "    \n" +
            "    # Find the intersection point of the two runners\n" +
            "    while True:\n" +
            "        slow = nums[slow]\n" +
            "        fast = nums[nums[fast]]\n" +
            "        if slow == fast:\n" +
            "            break\n" +
            "    \n" +
            "    # Find the entrance to the cycle\n" +
            "    slow = nums[0]\n" +
            "    while slow != fast:\n" +
            "        slow = nums[slow]\n" +
            "        fast = nums[fast]\n" +
            "    \n" +
            "    return slow"
        );
        
        // C++ solution
        findDuplicateSolutions.put("cpp",
            "class Solution {\n" +
            "public:\n" +
            "    int findDuplicate(vector<int>& nums) {\n" +
            "        // Floyd's Tortoise and Hare algorithm\n" +
            "        int slow = nums[0];\n" +
            "        int fast = nums[0];\n" +
            "        \n" +
            "        // Find the intersection point of the two runners\n" +
            "        do {\n" +
            "            slow = nums[slow];\n" +
            "            fast = nums[nums[fast]];\n" +
            "        } while (slow != fast);\n" +
            "        \n" +
            "        // Find the entrance to the cycle\n" +
            "        slow = nums[0];\n" +
            "        while (slow != fast) {\n" +
            "            slow = nums[slow];\n" +
            "            fast = nums[fast];\n" +
            "        }\n" +
            "        \n" +
            "        return slow;\n" +
            "    }\n" +
            "};"
        );
        
        // Set up solutions and complexities
        setupProblemSolutions(findDuplicateNumber, findDuplicateSolutions, "O(n)", "O(1)");
        
        // Set boilerplate code using text block for cleaner JSON
        findDuplicateNumber.setBoilerPlateCode("""
                {
                  "java": "class Solution {\\n    public int findDuplicate(int[] nums) {\\n        // Your code here\\n    }\\n}",
                  "javascript": "class Solution {\\n    /**\\n     * @param {number[]} nums\\n     * @return {number}\\n     */\\n    findDuplicate(nums) {\\n        // Your code here\\n    }\\n}",
                  "python": "class Solution:\\n    def findDuplicate(self, nums: List[int]) -> int:\\n        # Your code here\\n        pass",
                  "cpp": "class Solution {\\npublic:\\n    int findDuplicate(vector<int>& nums) {\\n        // Your code here\\n    }\\n};"
                }
                """);

        
        // Save all problems to the database
        practiceProblemRepository.save(validParentheses);
        practiceProblemRepository.save(minStack);
        practiceProblemRepository.save(implementQueue);
        practiceProblemRepository.save(maxDepthBinaryTree);
        practiceProblemRepository.save(levelOrderTraversal);
        practiceProblemRepository.save(reverseLinkedList);
        practiceProblemRepository.save(findDuplicateNumber);

        // --- Add default user if not exists ---
        String defaultEmail = "admin@example.com";
        if (!userRepository.existsByEmail(defaultEmail)) {
            User user = new User();
            user.setId(java.util.UUID.randomUUID().toString());
            user.setEmail(defaultEmail);
            user.setPassword(passwordEncoder.encode("admin123"));
            user.setFirstName("Admin");
            user.setLastName("User");
            user.setEmailVerified(true);
            userRepository.save(user);
        }
    }
    private Map<String, String> createSolutionMap(String java, String javascript, String python, String cpp) {
        Map<String, String> solutions = new HashMap<>();
        solutions.put("java", java);
        solutions.put("javascript", javascript);
        solutions.put("python", python);
        solutions.put("cpp", cpp);
        return solutions;
    }

    private void setupProblemSolutions(PracticeProblem problem,
                                     Map<String, String> solutions,
                                     String timeComplexity,
                                     String spaceComplexity) {
        // Create a new map to hold the solution details for each language
        Map<String, Map<String, String>> solutionsMap = new HashMap<>();
        
        // For each solution, create a map with code, timeComplexity, and spaceComplexity
        for (Map.Entry<String, String> entry : solutions.entrySet()) {
            String lang = entry.getKey();
            Map<String, String> solutionDetails = new HashMap<>();
            solutionDetails.put("code", entry.getValue());
            solutionDetails.put("timeComplexity", timeComplexity);
            solutionDetails.put("spaceComplexity", spaceComplexity);
            solutionsMap.put(lang, solutionDetails);
        }
        
        // Set the solutions map on the problem
        problem.setSolutions(solutionsMap);
        
        // Set the time and space complexity maps for backward compatibility
        Map<String, String> timeMap = new HashMap<>();
        Map<String, String> spaceMap = new HashMap<>();
        
        for (String lang : solutions.keySet()) {
            timeMap.put(lang, timeComplexity);
            spaceMap.put(lang, spaceComplexity);
        }
        
        problem.setTimeComplexity(timeMap);
        problem.setSpaceComplexity(spaceMap);
    }
}