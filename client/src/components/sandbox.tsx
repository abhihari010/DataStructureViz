import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronRight, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { LanguageSupport } from '@codemirror/language';

// Define supported languages and their extensions
export const SUPPORTED_LANGUAGES = {
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    lang: () => javascript({ jsx: true }),
    comment: '//',
  },
  typescript: {
    name: 'TypeScript',
    extension: 'ts',
    lang: () => javascript({ jsx: true, typescript: true }),
    comment: '//',
  },
  python: {
    name: 'Python',
    extension: 'py',
    lang: () => python(),
    comment: '#',
  },
  java: {
    name: 'Java',
    extension: 'java',
    lang: () => java(),
    comment: '//',
  },
  cpp: {
    name: 'C++',
    extension: 'cpp',
    lang: () => cpp(),
    comment: '//',
  },
} as const;

export type Language = keyof typeof SUPPORTED_LANGUAGES;

interface TestCase {
  input: any;
  expected: any;
  description: string;
}

interface TestResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  error?: string;
}

interface Problem {
  id: number | string;
  title: string;
  description: string;
  difficulty: string;
  defaultCode: string | Record<Language, string>;
  testCases: TestCase[];
  languageTemplates?: Partial<Record<Language, string>>;
}

interface SandboxProps {
  problem: Problem;
  onClose: () => void;
}

export function Sandbox({ problem, onClose }: SandboxProps) {
  const [activeLanguage, setActiveLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState<Record<Language, string>>(
    Object.keys(SUPPORTED_LANGUAGES).reduce((acc, lang) => {
      const langKey = lang as Language;
      acc[langKey] = '';
      return acc;
    }, {} as Record<Language, string>)
  );
  const [activeTab, setActiveTab] = useState('problem');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Initialize code from problem.defaultCode or templates
  // When switching languages, load user code if it exists, otherwise load the template
  useEffect(() => {
    const savedCode = localStorage.getItem(`sandbox_code_${problem.id}_${activeLanguage}`);
    const defaultCode = typeof problem.defaultCode === 'string'
      ? problem.defaultCode
      : problem.defaultCode[activeLanguage] || '';
    const languageTemplate = problem.languageTemplates?.[activeLanguage];
    const template = languageTemplate || defaultCode;

    // If savedCode is empty or only whitespace, use the template
    if (savedCode === null || savedCode.trim() === '') {
      setCode(prev => ({ ...prev, [activeLanguage]: template }));
      localStorage.setItem(`sandbox_code_${problem.id}_${activeLanguage}`, template);
    } else {
      setCode(prev => ({ ...prev, [activeLanguage]: savedCode }));
    }
  }, [problem.id, activeLanguage, problem.defaultCode, problem.languageTemplates]);

  const currentCode = useMemo(() => code[activeLanguage], [code, activeLanguage]);

  const handleCodeChange = (value: string) => {
    setCode(prev => ({
      ...prev,
      [activeLanguage]: value
    }));
    localStorage.setItem(`sandbox_code_${problem.id}_${activeLanguage}`, value);
  };
  
  const handleLanguageChange = (lang: Language) => {
    setActiveLanguage(lang);
  };

  const runTests = () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Simulate test execution (in a real app, this would be done in a Web Worker or server-side)
    setTimeout(() => {
      try {
        const results = problem.testCases.map((testCase, index) => {
          try {
            // In a real implementation, this would safely execute the user's code
            // For now, we'll simulate a passing/failing test
            const shouldPass = Math.random() > 0.3; // 70% chance of passing
            
            if (shouldPass) {
              return {
                passed: true,
                input: testCase.input,
                expected: testCase.expected,
                actual: testCase.expected, // In a real test, this would be the actual output
              };
            } else {
              return {
                passed: false,
                input: testCase.input,
                expected: testCase.expected,
                actual: "Incorrect result",
                error: "Test case failed: Expected different output"
              };
            }
          } catch (error) {
            return {
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: undefined,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
          }
        });
        
        setTestResults(results);
        setExpandedTest(0); // Expand first test result
      } catch (error) {
        console.error('Error running tests:', error);
      } finally {
        setIsRunning(false);
      }
    }, 1000);
  };

  const resetCode = () => {
    if (confirm('Are you sure you want to reset your code to the default?')) {
      const defaultCode = typeof problem.defaultCode === 'string' 
        ? problem.defaultCode 
        : problem.defaultCode[activeLanguage] || '';
      
      const languageTemplate = problem.languageTemplates?.[activeLanguage] || defaultCode;
      
      setCode(prev => ({
        ...prev,
        [activeLanguage]: languageTemplate
      }));
      
      localStorage.removeItem(`sandbox_code_${problem.id}_${activeLanguage}`);
    }
  };

  const toggleExpandTest = (index: number) => {
    setExpandedTest(expandedTest === index ? null : index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">{problem.title}</CardTitle>
              <div className="flex items-center mt-1 space-x-2">
                <Badge 
                  variant={
                    problem.difficulty === 'easy' ? 'secondary' : 
                    problem.difficulty === 'medium' ? 'outline' : 'destructive'
                  }
                  className={
                    problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {problem.difficulty}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Problem and Test Cases */}
          <div className="w-1/2 border-r flex flex-col">
            <Tabs defaultValue="problem" className="flex-1 flex flex-col">
              <TabsList className="rounded-none px-4">
                <TabsTrigger value="problem" onClick={() => setActiveTab('problem')}>
                  Problem
                </TabsTrigger>
                <TabsTrigger value="test-cases" onClick={() => setActiveTab('test-cases')}>
                  Test Cases
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-auto p-4">
                {activeTab === 'problem' ? (
                  <div>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: problem.description }} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {problem.testCases.map((testCase, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium">Test Case {index + 1}</div>
                        <div className="text-sm text-gray-600">{testCase.description}</div>
                        <div className="mt-2 text-sm">
                          <div><span className="font-medium">Input:</span> {JSON.stringify(testCase.input)}</div>
                          <div><span className="font-medium">Expected:</span> {JSON.stringify(testCase.expected)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
          
          {/* Right side - Code Editor and Results */}
          <div className="w-1/2 flex flex-col">
            <div className="border-b p-2 flex justify-between items-center">
              <div className="text-sm font-medium">Solution</div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetCode}
                  disabled={isRunning}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button 
                  onClick={runTests} 
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Run Tests
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border-b px-4 py-2 flex items-center justify-between bg-[#23272f]">
              <div className="text-sm font-medium text-gray-200">Language</div>
              <select
                value={activeLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="text-sm border rounded px-2 py-1 bg-[#23272f] text-gray-200 border-gray-600"
                disabled={isRunning}
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                  <option key={key} value={key}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 overflow-auto bg-[#181A20]">
              <div className="h-full">
                <CodeEditor
                  value={currentCode}
                  language={SUPPORTED_LANGUAGES[activeLanguage].extension}
                  placeholder={`Enter your ${SUPPORTED_LANGUAGES[activeLanguage].name} code here`}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  padding={15}
                  data-color-mode="dark"
                  style={{
                    fontSize: '14px',
                    backgroundColor: '#181A20',
                    color: '#f8f8f2',
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    height: '100%',
                    minHeight: '300px',
                  }}
                  className="rounded-b-lg"
                  readOnly={isRunning}
                />
              </div>
            </div>
            
            {testResults.length > 0 && (
              <div className="border-t h-1/3 flex flex-col">
                <div className="p-2 border-b font-medium">
                  Test Results
                  <span className="ml-2 text-sm text-gray-500">
                    {testResults.filter(r => r.passed).length} / {testResults.length} passed
                  </span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-2">
                    {testResults.map((result, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "border rounded p-2 text-sm cursor-pointer",
                          result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        )}
                        onClick={() => toggleExpandTest(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            Test Case {index + 1} - {result.passed ? 'Passed' : 'Failed'}
                          </div>
                          {expandedTest === index ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        
                        {expandedTest === index && (
                          <div className="mt-2 p-2 bg-white rounded border text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="font-medium">Input:</div>
                                <div className="p-1 bg-gray-50 rounded">
                                  {JSON.stringify(result.input, null, 2)}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">Expected:</div>
                                <div className="p-1 bg-gray-50 rounded">
                                  {JSON.stringify(result.expected, null, 2)}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="font-medium">Your Output:</div>
                                <div className={cn(
                                  "p-1 rounded",
                                  result.passed ? "bg-green-50" : "bg-red-50"
                                )}>
                                  {result.error ? (
                                    <div className="text-red-600">{result.error}</div>
                                  ) : (
                                    JSON.stringify(result.actual, null, 2)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Sandbox;