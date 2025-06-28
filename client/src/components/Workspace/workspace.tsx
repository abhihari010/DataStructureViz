import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'wouter';
import Split from 'react-split';
import './split-gutter.css';
import ProblemDescription, { TestCase, TabType } from './ProblemDescription/problemdescription';
import { Playground } from './Playground/playground';
import TestCasesPanel from './TestCasesPanel/TestCasesPanel';
import { executeCode as executeCodeApi, PracticeProblem, TestCaseResult } from '@/services/problemService';
import SolutionPanel from '@/components/SolutionPanel/solution-panel';
import { solutionsApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface WorkspaceProps {
  problem: PracticeProblem;
}

const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('problem');
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, 
  { passed: boolean; output?: any; error?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionMessage, setSubmissionMessage] = useState<string>('');
  const [lastRuntime, setLastRuntime] = useState<number | undefined>(undefined);
  const [lastMemory, setLastMemory] = useState<number | undefined>(undefined);

  // Helper to get a unique key for localStorage per problem and language
  const getLocalStorageKey = (problemId: number, language: string) => `dsa_code_${problemId}_${language}`;

  const runAllTestCases = useCallback(async () => {
    setIsRunning(true);
    setTestResults({}); // Clear previous results
    setLastRuntime(undefined);
    setLastMemory(undefined);

    try {
      const response = await executeCodeApi({
        code,
        language,
        problemId: problem.id,
      });

      // Use overall runtime/memory if present in the response
      setLastRuntime((response as any).runtime);
      setLastMemory((response as any).memory);

      const arr: TestCaseResult[] = response.results ?? response.test_case_results ?? [];
      const newMap: typeof testResults = {};
      arr.forEach(r => {
        newMap[r.case_number - 1] = {
          passed: r.passed,
          output: r.stdout,
          error:  r.stderr,
        };
      });
      setTestResults(newMap);

      if (!response.success) {
        // Optionally, show a toast or global error as well
        console.error('Execution Error:', response.error);
        // You could add a toast here if you have a toast system
      }
    } finally {
      setIsRunning(false);
    }
  }, [code, language, problem.id]);
  
  useEffect(() => {
    // Try to load code from localStorage first
    const saved = localStorage.getItem(getLocalStorageKey(problem.id, language));
    if (saved) {
      setCode(saved);
      return;
    }
    // Otherwise, load boilerplate
    const getBoilerplate = () => {
      if (!problem.boilerPlateCode) {
        return `// Write your ${language} code for ${problem.title} here`;
      }
      try {
        const boilerplates = JSON.parse(problem.boilerPlateCode);
        return boilerplates[language.toLowerCase()] || `// Write your ${language} code for ${problem.title} here`;
      } catch (e) {
        console.error("Failed to parse boilerplate code:", e);
        return "// Error loading boilerplate.";
      }
    };
    setCode(getBoilerplate());
  }, [problem, language]);

  // Save code to localStorage on every change
  useEffect(() => {
    localStorage.setItem(getLocalStorageKey(problem.id, language), code);
  }, [code, problem.id, language]);

  const parsedTestCases = useMemo((): TestCase[] => {
    const raw = problem?.testCases;
    if (!raw) return [];
  
    let arr: any[];
    if (typeof raw === 'string') {
      try {
        arr = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse test cases:", e);
        return [];
      }
    } else if (Array.isArray(raw)) {
      arr = raw;
    } else {
      console.error("Unexpected testCases type:", typeof raw, raw);
      return [];
    }
  
    return arr.map((tc) => ({
      input: tc.input,
      expected: tc.output,
      explanation: tc.explanation
    }));
  }, [problem?.testCases]);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  // Loading and error states are now handled by the parent ProblemPage component.

  // Sample solution data - in a real app, this would come from your backend
  const solutionExamples = {
    javascript: {
      code: `// JavaScript Solution
function isValid(s) {
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    python: {
      code: `# Python Solution
def isValid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    
    return not stack`,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    java: {
      code: `// Java Solution
import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    cpp: {
      code: `// C++ Solution
#include <stack>
#include <unordered_map>

class Solution {
public:
    bool isValid(std::string s) {
        std::stack<char> stack;
        std::unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
        
        for (char c : s) {
            if (mapping.find(c) != mapping.end()) {
                char top = stack.empty() ? '#' : stack.top();
                stack.pop();
                if (top != mapping[c]) {
                    return false;
                }
            } else {
                stack.push(c);
            }
        }
        return stack.empty();
    }
};`,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    }
  };

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Determine if all test cases have passed
  const totalCases = parsedTestCases.length;
  const passedCases = Object.values(testResults).filter(r => r.passed).length;
  const allTestsRun = Object.keys(testResults).length === totalCases;
  const allPassed = totalCases > 0 && passedCases === totalCases;

  const handleSubmit = useCallback(async () => {
    if (!allTestsRun || !allPassed) {
      setSubmissionMessage('Please run and pass all test cases before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage('');

    try {
      const response = await solutionsApi.saveSolution({
        problemId: problem.id,
        code,
        language,
        passed: true,
        runtime: lastRuntime,
        memory: lastMemory
      });

      setSubmissionMessage('Solution submitted successfully! Problem marked as completed.');
      
      // Invalidate submissions query to refresh the submissions tab
      queryClient.invalidateQueries({ queryKey: ['userSolutions'] });
      
      // Optionally refresh the page or update UI to show completion
      setTimeout(() => {
        setSubmissionMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting solution:', error);
      setSubmissionMessage('Failed to submit solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [allTestsRun, allPassed, problem.id, code, language, lastRuntime, lastMemory, queryClient]);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e]">
      <div className="flex-1 flex overflow-hidden">
        <Split className="split flex-1" sizes={[40,60]} direction="horizontal" gutterSize={6}>
          {/* Left pane: problem text and solutions */}
          <div className="flex flex-col h-full overflow-hidden">
            {/* Home Button */}
            <div className="flex items-center px-4 py-2 border-b border-gray-700 bg-gray-800/50">
              <button 
                onClick={() => window.history.back()}
                className="text-gray-300 hover:text-white flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto ">
              <ProblemDescription
                title={problem.title}
                difficulty={problem.difficulty}
                problemStatement={problem.description}
                examples={parsedTestCases.slice(0, 2).map((tc, idx) => ({
                  id: idx + 1,
                  input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
                  output: typeof tc.expected === 'string' ? tc.expected : JSON.stringify(tc.expected),
                  explanation: tc.explanation
                }))}
                constraints={problem.constraints ? problem.constraints.map(c => c.constraint) : []}
                topics={problem.topic ? [problem.topic] : []}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                showTabs={true}
                problem={{
                  solutions: problem.solutions,
                  timeComplexity: problem.timeComplexity,
                  spaceComplexity: problem.spaceComplexity
                }}
                problemId={problem.id}
              />
            </div>
          </div>

          {/* Right pane: editor + test cases */}
          <Split className="split flex flex-col" sizes={[60,40]} direction="vertical" gutterSize={6}>
            {/* Submission Message */}
            {submissionMessage && (
              <div className={`px-4 py-2 text-sm font-medium ${
                submissionMessage.includes('successfully') 
                  ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                  : 'bg-red-900/30 text-red-400 border border-red-800/50'
              }`}>
                {submissionMessage}
              </div>
            )}
            <Playground
              code={code}
              language={language}
              isRunning={isRunning}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
              onRunTests={runAllTestCases}
              onSubmit={handleSubmit}
              canSubmit={allTestsRun && allPassed}
              isSubmitting={isSubmitting}
            />
            <TestCasesPanel
              testCases={parsedTestCases}
              testResults={testResults}
            />
          </Split>
        </Split>
      </div>
    </div>
  );
};

export default Workspace;
