import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import Split from 'react-split';
import './split-gutter.css';
import ProblemDescription, { TestCase, TabType } from './ProblemDescription/problemdescription';
import { Playground } from './Playground/playground';
import TestCasesPanel from './TestCasesPanel/TestCasesPanel';
import { executeCode as executeCodeApi, submitSolutionApi, ExecutionRequestError, PracticeProblem, TestCaseResult } from '@/services/problemService';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import {
  progressQueryKeys,
  useProblemProgress,
  useRecordProgressOutcome,
  useSaveProgressDraft,
} from '@/features/progress/progressHooks';

interface WorkspaceProps {
  problem: PracticeProblem;
}

const MAX_DRAFT_CODE_LENGTH = 100_000;
const ACTIVE_TIME_SAVE_INTERVAL_SECONDS = 15;

function getBoilerplateCode(problem: PracticeProblem, language: string): string {
  if (!problem.boilerPlateCode) {
    return `// Write your ${language} code for ${problem.title} here`;
  }
  try {
    const boilerplates = JSON.parse(problem.boilerPlateCode);
    return boilerplates[language.toLowerCase()] || `// Write your ${language} code for ${problem.title} here`;
  } catch (error) {
    console.error('Failed to parse boilerplate code:', error);
    return '// Error loading boilerplate.';
  }
}

const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const progressQuery = useProblemProgress(problem.id);
  const saveDraftMutation = useSaveProgressDraft();
  const recordOutcomeMutation = useRecordProgressOutcome();
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('problem');
  const [testResults, setTestResults] = useState<Record<number, 
  { passed: boolean; output?: any; error?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionMessage, setSubmissionMessage] = useState<string>('');
  const [lastRuntime, setLastRuntime] = useState<number | undefined>(undefined);
  const [lastMemory, setLastMemory] = useState<number | undefined>(undefined);
  const [lastReceiptId, setLastReceiptId] = useState<string | null>(null);
  const [activeCase, setActiveCase] = useState(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autosaveRevision, setAutosaveRevision] = useState(0);
  const playgroundRef = useRef<any>(null);
  const hydratedProblemIdRef = useRef<number | null>(null);
  const timeSpentRef = useRef(0);
  const activeSinceRef = useRef<number | null>(null);
  const lastTimeAutosaveRef = useRef(0);
  const lastSavedDraftRef = useRef<string | null>(null);

  // Helper to get a unique key for localStorage per problem and language
  const getLocalStorageKey = (problemId: number, language: string) => `dsa_code_${problemId}_${language}`;

  const recordAttempt = useCallback((status: string, resultStatus: string, runtime?: number, memory?: number) => {
    recordOutcomeMutation.mutate({
      problemId: problem.id,
      input: {
        status,
        resultStatus,
        language,
        code: code.slice(0, MAX_DRAFT_CODE_LENGTH),
        runtime,
        memory,
      },
    });
  }, [code, language, problem.id, recordOutcomeMutation]);

  const runAllTestCases = useCallback(async () => {
    setIsRunning(true);
    setTestResults({}); // Clear previous results
    setExecutionError('');
    setLastRuntime(undefined);
    setLastMemory(undefined);
    setLastReceiptId(null);

    try {
      const response = await executeCodeApi({
        code,
        language,
        problemId: problem.id,
      });

      // Use overall runtime/memory if present in the response
      setLastRuntime((response as any).runtime);
      setLastMemory((response as any).memory);
      setLastReceiptId(response.success ? response.receipt?.receipt_id ?? null : null);

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
        setExecutionError(response.message || response.error || 'Execution did not complete.');
        recordAttempt(
          response.status || 'FAILED',
          response.failure_code || response.status || 'EXECUTION_FAILED',
          response.runtime,
          response.memory,
        );
      }
    } catch (error) {
      const message = error instanceof ExecutionRequestError
        ? error.message
        : 'Execution failed. Please try again.';
      setExecutionError(message);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, problem.id, recordAttempt]);
  
  useEffect(() => {
    if (progressQuery.isLoading || hydratedProblemIdRef.current === problem.id) return;

    const savedLanguage = progressQuery.data?.draftLanguage || 'javascript';
    const savedDraft = progressQuery.data?.draftCode;
    const localDraft = localStorage.getItem(getLocalStorageKey(problem.id, savedLanguage));
    const initialCode = savedDraft ?? localDraft ?? getBoilerplateCode(problem, savedLanguage);
    const initialTime = progressQuery.data?.timeSpentSeconds ?? 0;

    hydratedProblemIdRef.current = problem.id;
    timeSpentRef.current = initialTime;
    lastTimeAutosaveRef.current = initialTime;
    setLanguage(savedLanguage);
    setCode(initialCode);
    setTimeSpentSeconds(initialTime);
  }, [problem, progressQuery.data, progressQuery.isLoading]);

  // Keep a local fallback while the bounded server draft is being persisted.
  useEffect(() => {
    if (hydratedProblemIdRef.current !== problem.id) return;
    localStorage.setItem(getLocalStorageKey(problem.id, language), code);
  }, [code, problem.id, language]);

  // Debounce bounded draft writes so typing does not create a request per keypress.
  useEffect(() => {
    if (hydratedProblemIdRef.current !== problem.id) return;
    const boundedCode = code.slice(0, MAX_DRAFT_CODE_LENGTH);
    const fingerprint = `${language}:${boundedCode}:${timeSpentRef.current}`;
    if (fingerprint === lastSavedDraftRef.current) return;

    const timer = window.setTimeout(() => {
      setDraftStatus('saving');
      saveDraftMutation.mutate(
        {
          problemId: problem.id,
          input: {
            draftCode: boundedCode,
            draftLanguage: language,
            timeSpentSeconds: Math.min(timeSpentRef.current, 604_800),
          },
        },
        {
          onSuccess: () => {
            lastSavedDraftRef.current = fingerprint;
            setDraftStatus('saved');
          },
          onError: () => setDraftStatus('error'),
        },
      );
    }, 900);

    return () => window.clearTimeout(timer);
  }, [autosaveRevision, code, language, problem.id, saveDraftMutation]);

  // Count only visible time. A hidden tab pauses the clock and flushes one draft.
  useEffect(() => {
    if (hydratedProblemIdRef.current !== problem.id) return;

    const updateActiveTime = (persist: boolean) => {
      if (activeSinceRef.current === null) return;
      const elapsed = Math.floor((Date.now() - activeSinceRef.current) / 1000);
      if (elapsed <= 0) return;

      const nextTime = Math.max(timeSpentRef.current, timeSpentRef.current + elapsed);
      timeSpentRef.current = nextTime;
      setTimeSpentSeconds(nextTime);
      activeSinceRef.current = persist ? null : Date.now();

      if (persist || nextTime - lastTimeAutosaveRef.current >= ACTIVE_TIME_SAVE_INTERVAL_SECONDS) {
        lastTimeAutosaveRef.current = nextTime;
        setAutosaveRevision((revision) => revision + 1);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateActiveTime(true);
      } else if (activeSinceRef.current === null) {
        activeSinceRef.current = Date.now();
      }
    };

    activeSinceRef.current = document.hidden ? null : Date.now();
    const interval = window.setInterval(() => {
      if (!document.hidden) updateActiveTime(false);
    }, 1_000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateActiveTime(true);
    };
  }, [problem.id]);

  const parsedTestCases = useMemo((): TestCase[] => {
    const raw = problem?.examples;
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
      console.error("Unexpected public examples type:", typeof raw, raw);
      return [];
    }
  
    return arr.map((tc) => ({
      input: tc.input,
      expected: tc.output,
      explanation: tc.explanation
    }));
  }, [problem?.examples]);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setLastReceiptId(null);
    if (executionError) setExecutionError('');
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setLastReceiptId(null);
  };

  // Loading and error states are now handled by the parent ProblemPage component.

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
    if (!allTestsRun || !allPassed || !lastReceiptId) {
      setSubmissionMessage('Please run and pass all test cases before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage('');

    try {
      await submitSolutionApi({
        problemId: problem.id,
        code,
        language,
        receiptId: lastReceiptId,
        runtime: lastRuntime,
        memory: lastMemory
      });

      setSubmissionMessage('Solution submitted successfully. Your server-verified progress will refresh shortly.');
      
      // Invalidate submissions query to refresh the submissions tab
      queryClient.invalidateQueries({ queryKey: ['userSolutions'] });
      queryClient.invalidateQueries({ queryKey: progressQueryKeys.problem(problem.id) });
      queryClient.invalidateQueries({ queryKey: progressQueryKeys.problems() });
      queryClient.invalidateQueries({ queryKey: progressQueryKeys.summary() });
      
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
  }, [allTestsRun, allPassed, lastReceiptId, problem.id, code, language, lastRuntime, lastMemory, queryClient]);

  return (
    <div className="app-coding-workspace flex flex-col bg-[#1e1e1e]">
      <div className="flex-1 flex overflow-hidden">
        <Split className="split flex-1" sizes={[40,60]} direction="horizontal" gutterSize={6} minSize={[200, 200]}>
          {/* Left pane: problem text and solutions */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="app-coding-back flex items-center px-4 py-2 border-b border-gray-700 bg-gray-800/50">
              <button
                onClick={() => setLocation("/practice")}
                className="text-gray-300 hover:text-white flex items-center text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to practice
              </button>
              <div className="ml-auto flex items-center gap-3 text-xs text-gray-400" aria-live="polite">
                <span>{Math.floor(timeSpentSeconds / 60)}m active</span>
                {draftStatus === 'saving' && <span>Saving draft…</span>}
                {draftStatus === 'saved' && <span className="text-green-400">Draft saved</span>}
                {draftStatus === 'error' && <span className="text-red-400">Draft could not be saved</span>}
              </div>
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
                  output: typeof tc.expected === 'string'
                    ? tc.expected
                    : JSON.stringify(tc.expected),
                  explanation: tc.explanation,
                }))}
                constraints={Array.isArray(problem.constraints) && typeof problem.constraints[0] === 'object' ? problem.constraints.map((c: any) => c.constraint) : (problem.constraints || [])}
                topics={problem.topic ? [problem.topic] : []}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                showTabs={true}
                problem={problem}
                problemId={problem.id}
              />
            </div>
          </div>

          {/* Right pane: editor + test cases */}
          <Split className="split flex min-h-0 self-stretch flex-col" sizes={[60,40]} direction="vertical" gutterSize={6} minSize={[200, 200]}
            onDragEnd={() => {
              if (playgroundRef.current && playgroundRef.current.layout) {
                playgroundRef.current.layout();
              }
            }}
          >
            <div className="flex min-h-0 flex-col overflow-hidden">
              {submissionMessage && (
                <div className={`px-4 py-2 text-sm font-medium ${
                  submissionMessage.includes('successfully')
                    ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                    : 'bg-red-900/30 text-red-400 border border-red-800/50'
                }`}>
                  {submissionMessage}
                </div>
              )}
              <div className="min-h-0 flex-1">
                <Playground
                  ref={playgroundRef}
                  code={code}
                  language={language}
                  isRunning={isRunning}
                  executionError={executionError}
                  onCodeChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  onRunTests={runAllTestCases}
                  onSubmit={handleSubmit}
                  canSubmit={allTestsRun && allPassed && !!lastReceiptId}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
            <TestCasesPanel
              testCases={parsedTestCases}
              testResults={testResults}
              activeCase={activeCase}
              setActiveCase={setActiveCase}
              language={language}
              parameters={problem.methodSignature?.parameters}
            />
          </Split>
        </Split>
      </div>
    </div>
  );
};

export default Workspace;
