import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'wouter';
import Split from 'react-split';
import './split-gutter.css';
import ProblemDescription, { TestCase, TabType } from './ProblemDescription/problemdescription';
import { Playground } from './Playground/playground';
import TestCasesPanel from './TestCasesPanel/TestCasesPanel';
import { executeCode as executeCodeApi, PracticeProblem, TestCaseResult } from '@/services/problemService';

interface WorkspaceProps {
  problem: PracticeProblem;
}

const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('problem');
  const [testResults, setTestResults] = useState<Record<number, 
  { passed: boolean; output?: any; error?: string }>>({});

  const runAllTestCases = useCallback(async () => {
    setIsRunning(true);
    setTestResults({}); // Clear previous results

    try {
      const response = await executeCodeApi({
        code,
        language,
        problemId: problem.id,
      });

      if (!response.success) {
        // Handle execution error, maybe show a toast notification in the future
        console.error('Execution Error:', response.error);
        return;
      }

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
    } finally {
      setIsRunning(false);
    }
  }, [code, language, problem.id]);
  
  useEffect(() => {
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
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  


  // Loading and error states are now handled by the parent ProblemPage component.

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e]">
      <div className="flex-1 flex overflow-hidden">
        <Split className="split flex-1" sizes={[40,60]} direction="horizontal" gutterSize={6}>

          {/* Left pane: problem text */}
          <div className="overflow-y-auto">
            <ProblemDescription
              title={problem.title}
              difficulty={problem.difficulty}
              problemStatement={problem.description}
              examples={[]}        // wire your real examples if you have them
              constraints={[]}
              topics={problem.topic ? [problem.topic] : []}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Right pane: editor + test cases */}
          <Split className="split flex flex-col" sizes={[60,40]} direction="vertical" gutterSize={6}>
            <Playground
              code={code}
              language={language}
              isRunning={isRunning}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
              onRunTests={runAllTestCases}   /* ← new */
              onSubmit={() => Promise.resolve()}  /* your future DB-submit */
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
