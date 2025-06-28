import React, { useState } from 'react';
import { TestCase } from '../ProblemDescription/problemdescription';

interface TestCasesPanelProps {
  testCases: TestCase[];
  testResults: Record<number, { passed: boolean; output?: any; error?: string }>;
}

const TestCasesPanel: React.FC<TestCasesPanelProps> = ({ testCases, testResults }) => {
  const [activeCase, setActiveCase] = useState(0);

  if (!testCases || testCases.length === 0) {
    return (
      <div className="p-4 bg-[#1e1e1e] text-white h-full">
        <h3 className="text-lg font-semibold mb-2">Test Cases</h3>
        <p>No test cases available for this problem.</p>
      </div>
    );
  }

  const totalCases = testCases.length;
  const passedCases = Object.values(testResults).filter(r => r.passed).length;
  const allTestsRun = Object.keys(testResults).length === totalCases;
  const allPassed = totalCases > 0 && passedCases === totalCases;

  const renderInput = (input: TestCase['input']) => {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      return Object.entries(input)
        .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
        .join('\n');
    }
    return Array.isArray(input) ? JSON.stringify(input) : JSON.stringify(input, null, 2);
    };

  const getResultStatus = () => {
    if (!allTestsRun) return null;
    if (allPassed) {
      return <h3 className="text-2xl font-semibold text-green-500">Accepted</h3>;
    } else {
      return <h3 className="text-2xl font-semibold text-red-500">Wrong Answer</h3>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        {getResultStatus()}
        {allTestsRun && (
          <p className="text-gray-400">
            Passed test cases: {passedCases} / {totalCases}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-2">
        {testCases.map((_, index) => {
          const result = testResults[index];
          let buttonClass = 'py-1 px-3 text-sm rounded-md ';
          if (result) {
            buttonClass += result.passed ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300';
          } else {
            buttonClass += 'bg-[#2d2d2d] hover:bg-gray-700';
          }
          if (activeCase === index) {
            buttonClass += ' ring-2 ring-blue-500';
          }

          return (
            <button key={index} onClick={() => setActiveCase(index)} className={buttonClass}>
              Case {index + 1}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Input:</p>
            <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm overflow-x-auto">
              {renderInput(testCases[activeCase].input)}
            </pre>
          </div>
          {testResults[activeCase] ? (
            <>
              <div>
                <p className="font-semibold">Your Output:</p>
                <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm overflow-x-auto">
                  {JSON.stringify(testResults[activeCase].output, null, 2)}
                </pre>
              </div>
              <div>
                <p className="font-semibold">Expected output:</p>
                <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm overflow-x-auto">
                  {JSON.stringify(testCases[activeCase].expected, null, 2)}
                </pre>
              </div>
              {testResults[activeCase].error && (
                <div>
                  <p className="font-semibold text-red-500">Error:</p>
                  <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm text-red-500 overflow-x-auto">
                    {testResults[activeCase].error}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="font-semibold">Expected Output:</p>
              <pre className="bg-[#2d2d2d] p-2 rounded mt-1 text-sm overflow-x-auto">
                {JSON.stringify(testCases[activeCase].expected, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCasesPanel;
