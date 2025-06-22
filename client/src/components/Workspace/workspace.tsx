import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'wouter';
import Split from 'react-split';
import './split-gutter.css';
import ProblemDescription, { TestCase, TabType } from './ProblemDescription/problemdescription';
import { Playground } from './Playground/playground';
import TestCasesPanel from './TestCasesPanel/TestCasesPanel';
import { executeCode as executeCodeApi, getProblemById, PracticeProblem } from '@/services/problemService';

interface WorkspaceProps {
  problem: PracticeProblem;
}

const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('problem');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<number, { passed: boolean; output?: any; error?: string }>>({});

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
    if (!problem?.testCases) return [];
    try {
      // The backend sends testCases as a JSON string, so we parse it here.
      const parsed = JSON.parse(problem.testCases);
      // Convert from {input: any, output: any}[] to TestCase[]
      return Array.isArray(parsed) 
        ? parsed.map(tc => ({
            input: tc.input,
            expected: tc.output, // Map 'output' to 'expected' to match our interface
            explanation: tc.explanation
          }))
        : [];
    } catch (e) {
      console.error("Failed to parse test cases:", e);
      return [];
    }
  }, [problem?.testCases]);

  const executeTestCase = useCallback(async (testCase: TestCase, index: number) => {
    setIsRunning(true);
    setConsoleOutput(prev => prev + `\nRunning test case ${index + 1} with input: ${JSON.stringify(testCase.input)}\n`);
    
    try {
      // Handle different input formats
      let parsedInput = testCase.input;
      if (typeof testCase.input === 'string') {
        try {
          // Try to parse as JSON if it's a string that looks like JSON
          if (testCase.input.trim().startsWith('{') || testCase.input.trim().startsWith('[')) {
            parsedInput = JSON.parse(testCase.input);
          }
        } catch (e) {
          // If parsing fails, keep the original string
          console.log('Input is not valid JSON, using as string');
        }
      }

      // Ensure expected output is properly formatted
      let parsedExpected = testCase.expected;
      if (typeof testCase.expected === 'string') {
        try {
          parsedExpected = JSON.parse(testCase.expected);
        } catch (e) {
          // If parsing fails, keep the original string
          console.log('Expected output is not valid JSON, using as string');
        }
      }
      
      console.log('Sending to backend:', { 
        input: parsedInput, 
        expectedOutput: parsedExpected 
      });
      
      const response = await executeCodeApi({
        code,
        language,
        problemId: problem.id,
        input: parsedInput,
        expectedOutput: parsedExpected,
      });
      
      console.log('Received from backend:', response);
      
      const result = {
        passed: response.passed,
        output: response.output,
        error: response.error,
      };

      setTestResults(prev => ({ ...prev, [index]: result }));

      setConsoleOutput(prev => prev + 
        `Input: ${JSON.stringify(parsedInput, null, 2)}\n` +
        `Expected: ${JSON.stringify(parsedExpected, null, 2)}\n` +
        `Output: ${result.output || 'No output'}\n` +
        `Result: ${result.passed ? '✓ Passed' : '✗ Failed'}\n`
      );
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to execute code';
      console.error('Error executing test case:', err);
      setConsoleOutput(prev => prev + `Error: ${errorMsg}\n`);
      setTestResults(prev => ({
        ...prev, 
        [index]: { 
          passed: false, 
          error: errorMsg,
          output: undefined
        } 
      }));
    } finally {
      setIsRunning(false);
    }
  }, [code, language, problem]);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  const handleClearConsole = () => {
    setConsoleOutput('');
  };

  // Loading and error states are now handled by the parent ProblemPage component.

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e]">
      <div className="flex-1 flex overflow-hidden">
        <Split
          className="split flex flex-1 group"
          sizes={[40, 60]}
          minSize={[400, 400]}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          gutterStyle={() => ({
            'backgroundColor': '#3a3a3a',
            'backgroundImage': 'repeating-linear-gradient(0deg, #555, #555 1px, #3a3a3a 1px, #3a3a3a 6px)',
            'backgroundSize': '1px 6px',
            'cursor': 'col-resize',
            'margin': '0 -2px',
            'width': '14px',
            'zIndex': '10'
          })}
          onDragStart={() => {
            document.body.style.cursor = 'col-resize';
          }}
          onDragEnd={() => {
            document.body.style.cursor = '';
          }}
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
        >
          <div className="h-full overflow-y-auto">
            <ProblemDescription 
              title={problem.title}
              difficulty={problem.difficulty}
              problemStatement={problem.description}
              examples={[] /* Data not available from backend yet */}
              constraints={[] /* Data not available from backend yet */}
              topics={problem.topic ? [problem.topic] : []}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
          <Split
            className="split flex flex-col h-full"
            direction="vertical"
            sizes={[60, 40]}
            minSize={[200, 100]}
            gutterSize={10}
            gutterAlign="center"
            gutterStyle={() => ({
              'backgroundColor': '#3a3a3a',
              'backgroundImage': 'repeating-linear-gradient(90deg, #555, #555 1px, #3a3a3a 1px, #3a3a3a 6px)',
              'backgroundSize': '6px 1px',
              'cursor': 'row-resize',
              'margin': '-2px 0',
              'height': '14px',
              'zIndex': '10'
            })}
            onDragStart={() => {
              document.body.style.cursor = 'row-resize';
            }}
            onDragEnd={() => {
              document.body.style.cursor = '';
            }}
            snapOffset={30}
            dragInterval={1}
          >
            <div className="h-full overflow-hidden">
              <Playground 
                code={code}
                language={language}
                onCodeChange={handleCodeChange}
                onLanguageChange={handleLanguageChange}
                isRunning={isRunning}
                consoleOutput={consoleOutput}
                onClearConsole={handleClearConsole}
              />
            </div>
            <div className="h-full overflow-hidden">
              <TestCasesPanel 
                testCases={parsedTestCases}
                onRunTestCase={executeTestCase}
                testResults={testResults}
              />
            </div>
          </Split>
        </Split>
      </div>
    </div>
  );
};

export default Workspace;
