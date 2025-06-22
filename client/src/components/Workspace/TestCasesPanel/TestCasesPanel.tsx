import React, { useState } from 'react';
import { TestCase } from '../ProblemDescription/problemdescription';

interface TestCasesPanelProps {
  testCases: TestCase[];
  onRunTestCase: (testCase: TestCase, index: number) => void;
  testResults: Record<number, { passed: boolean; output?: any; error?: string }>;
}

const TestCasesPanel: React.FC<TestCasesPanelProps> = ({ testCases, onRunTestCase, testResults }) => {
  const [activeCase, setActiveCase] = useState(0);

  if (!testCases || testCases.length === 0) {
    return (
      <div className="p-4 bg-[#1e1e1e] text-white h-full">
        <h3 className="text-lg font-semibold mb-2">Test Cases</h3>
        <p>No test cases available for this problem.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Test Cases</h3>
          <button
            onClick={() => onRunTestCase(testCases[activeCase], activeCase)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Run Test
          </button>
        </div>
        <div className="flex border-b border-gray-700">
          {testCases.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCase(index)}
              className={`py-2 px-4 text-sm font-medium ${
                activeCase === index
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              Case {index + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Input:</p>
            <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm overflow-x-auto">
              {JSON.stringify(testCases[activeCase].input, null, 2)}
            </pre>
          </div>
          <div>
            <p className="font-semibold">Expected Output:</p>
            <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm overflow-x-auto">
              {typeof testCases[activeCase].expected === 'string' 
                ? testCases[activeCase].expected 
                : JSON.stringify(testCases[activeCase].expected, null, 2)}
            </pre>
          </div>
          {testResults[activeCase] && (
            <div>
              <p className={`font-semibold ${testResults[activeCase].passed ? 'text-green-500' : 'text-red-500'}`}>
                {testResults[activeCase].passed ? '✓ Passed' : '✗ Failed'}
              </p>
              <p className="font-semibold">Output:</p>
              <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm overflow-x-auto">
                {testResults[activeCase].output}
              </pre>
              {testResults[activeCase].error && (
                <>
                  <p className="font-semibold text-red-500 mt-2">Error:</p>
                  <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm text-red-500 overflow-x-auto">
                    {testResults[activeCase].error}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCasesPanel;
