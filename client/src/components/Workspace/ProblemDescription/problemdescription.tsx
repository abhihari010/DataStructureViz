import React, { useState, useEffect } from 'react';
import { ThumbsUp, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import SolutionPanel from '@/components/SolutionPanel/solution-panel';
import { Solution } from '@/services/problemService';
import ReactMarkdown from 'react-markdown';
import TreeSVG from './TreeSVG';
import { arrayToTree } from '@/lib/utils';
import { solutionsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Represents a single test case for a problem
export interface TestCase {
  input: Record<string, any> | string | number; // Input data for the test case
  expected: any; // Expected output
  explanation?: string; // Optional explanation for the test case
}

// Represents a submission in the submissions tab
interface Submission {
  id: number;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Compile Error';
  language: string;
  runtime?: string;
  memory?: string;
  timestamp: string;
  passed: boolean;
  code?: string;
}

// Defines the available tabs in the problem description section
export type TabType = 'problem' | 'solutions' | 'submissions' | 'notes';

// Props for the ProblemDescription component
interface ProblemDescriptionProps {
  title: string; // The title of the problem
  difficulty: 'Easy' | 'Medium' | 'Hard'; // The difficulty level
  problemStatement: string; // The main description of the problem
  examples: Array<{ // A list of examples to illustrate the problem
    id: number;
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[]; // A list of constraints for the problem
  topics: string[]; // A list of related topics or tags
  activeTab?: TabType; // The currently active tab
  onTabChange?: (tab: TabType) => void; // Callback to change the active tab
  showTabs?: boolean; // Whether to show the tab navigation
  className?: string; // Additional CSS class names
  problem?: {
    solutions?: {
      [key: string]: Solution;
    };
    timeComplexity?: {
      [key: string]: string;
    };
    spaceComplexity?: {
      [key: string]: string;
    };
  };
  problemId?: number; // Add problemId prop
}

/**
 * A purely presentational component to display the details of a programming problem.
 * It receives all data and callbacks as props and does not manage its own data fetching.
 */
const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  title,
  difficulty,
  problem,
  className = '',
  problemStatement,
  examples = [],
  constraints = [],
  topics = [],
  activeTab: externalActiveTab = 'problem',
  onTabChange,
  showTabs = false,
  problemId,
}) => {
  // Local UI state
  const [expandedExample, setExpandedExample] = useState<number | null>(0);
  const [likeCount, setLikeCount] = useState(42);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(externalActiveTab);
  const [notes, setNotes] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Update active tab when prop changes
  useEffect(() => {
    setActiveTab(externalActiveTab);
  }, [externalActiveTab]);
  
  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Handle like/dislike functionality
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
      setLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setLiked(true);
      if (disliked) setDisliked(false);
    }
  };

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
    } else {
      setDisliked(true);
      if (liked) {
        setLiked(false);
        setLikeCount(prev => prev - 1);
      }
    }
  };

  // Toggle example expansion
  const toggleExample = (index: number) => {
    setExpandedExample(prev => prev === index ? null : index);
  };

  // Save notes to localStorage
  useEffect(() => {
    if (title) {
      const savedNotes = localStorage.getItem(`notes_${title}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [title]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (title) {
      localStorage.setItem(`notes_${title}`, newNotes);
    }
  };

  const clearNotes = () => {
    setNotes('');
    if (title) {
      localStorage.removeItem(`notes_${title}`);
    }
  };

  // Main navigation tabs
  const mainTabs = [
    { id: 'problem' as const, label: 'Question' },
    { id: 'solutions' as const, label: 'Solution' },
    { id: 'submissions' as const, label: 'Submissions' },
    { id: 'notes' as const, label: 'Notes' },
  ] as const;

  // Fetch user submissions for this problem
  const { data: submissions = [], isLoading: submissionsLoading, error: submissionsError } = useQuery({
    queryKey: ['userSolutions', problemId],
    queryFn: async () => {
      try {
        const response = await solutionsApi.getUserSolutions(problemId);
        return response || [];
      } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }
    },
    enabled: activeTab === 'submissions' && !!problemId,
    retry: 1, // Only retry once to avoid infinite loops
  });

  // Transform submissions to match the expected format
  const transformedSubmissions: Submission[] = submissions.map((sub: any) => ({
    id: sub.id,
    status: sub.passed ? 'Accepted' : 'Wrong Answer',
    language: sub.language,
    runtime: sub.runtime,
    memory: sub.memory,
    timestamp: sub.submittedAt || sub.submitted_at,
    passed: sub.passed,
    code: sub.code,
  }));

  // Render the tab navigation
  const renderTabs = () => {
    if (!showTabs) return null;
    
    return (
      <div className="relative flex-shrink-0 border-b border-gray-700 bg-gray-800/50">
        <div className="flex">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-6 py-3 text-sm font-medium flex items-center transition-colors ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  style={{
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 1) 50%, rgba(59, 130, 246, 0.5) 100%)',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
                  }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent" />
      </div>
    );
  };

  // Render the problem header
  const renderProblemHeader = () => (
    <div className="bg-[#262626] text-white w-full">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-100">{title}</h2>
        <div className="flex items-center mt-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              difficulty === 'Easy' ? 'bg-green-800 text-green-200' :
              difficulty === 'Medium' ? 'bg-yellow-800 text-yellow-200' :
              'bg-red-800 text-red-200'
            }`}
          >
            {difficulty}
          </span>
          <div className="flex items-center ml-4 text-gray-400">
            <button 
              onClick={handleLike} 
              className={`flex items-center mr-3 hover:text-white ${liked ? 'text-green-500' : ''}`}
              aria-label="Like this problem"
            >
              <ThumbsUp size={16} className="mr-1" /> {likeCount}
            </button>
            <button 
              onClick={handleDislike} 
              className={`flex items-center hover:text-white ${disliked ? 'text-red-500' : ''}`}
              aria-label="Dislike this problem"
            >
              <ThumbsUp size={16} className="transform -scale-y-100" />
            </button>
          </div>
          <div className="flex-grow" />
          <div className="flex items-center space-x-2 text-sm">
            {topics.map((topic) => (
              <span key={topic} className="text-xs bg-gray-700 px-2 py-1 rounded">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render the problem content
  const isTreeProblem = topics.includes('binary-tree') || title.toLowerCase().includes('tree');
  const firstExampleInput = examples[0]?.input;

  const renderProblemContent = () => (
    <div className="p-4">
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{problemStatement}</ReactMarkdown>
      </div>

      {/* Tree SVG visualization for tree problems */}
      {isTreeProblem && firstExampleInput && (
        <div className="mb-6">
          <div className="font-semibold mb-1">Tree Visualization (Example 1):</div>
          <TreeSVG tree={arrayToTree(JSON.parse(firstExampleInput))} />
        </div>
      )}

      {/* LeetCode-style Examples */}
      {examples && examples.length > 0 && (
        <div className="mt-6">
          {[...examples].slice(0, 2).map((example, idx) => (
            <div key={idx} className="mb-6">
              <div className="font-semibold mb-1">Example {idx + 1}:</div>
              <pre className="bg-gray-900 rounded p-3 text-sm mb-1">
                <span className="font-bold">Input:</span> {example.input}
              </pre>
              <pre className="bg-gray-900 rounded p-3 text-sm">
                <span className="font-bold">Output:</span> {example.output}
              </pre>
              {example.explanation && (
                <div className="bg-gray-900 rounded p-3 text-sm mt-1">
                  <span className="font-bold">Explanation:</span> {example.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {constraints.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Constraints:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            {constraints.map((constraint, index) => (
              <li key={index} className="font-mono">{constraint}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // Render the solution content
  const renderSolutionContent = () => {
    // Get solutions from the problem data if available
    if (problem?.solutions) {
      return (
        <SolutionPanel 
          solutions={problem.solutions}
          timeComplexity={problem.timeComplexity}
          spaceComplexity={problem.spaceComplexity}
        />
      );
    }

    // Show a message when no solutions are available
    return (
      <Card className={cn("border border-gray-200 dark:border-gray-800", className)}>
        <CardHeader>
          <CardTitle>Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Solution coming soon</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render the submissions content
  const renderSubmissionsContent = () => {
    const formatTimestamp = (timestamp: string) => {
      return new Date(timestamp).toLocaleString();
    };

    return (
      <div className="p-4 h-full overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Submissions</h3>
          <div className="text-sm text-gray-400">
            {submissionsLoading ? 'Loading...' : `Showing ${transformedSubmissions.length} submission${transformedSubmissions.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        
        {submissionsLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
            <p className="text-center">Loading submissions...</p>
          </div>
        ) : submissionsError ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-center">Failed to load submissions</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later</p>
          </div>
        ) : transformedSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-center">No submissions yet</p>
            <p className="text-sm text-gray-500 mt-2">Your submission history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transformedSubmissions.map((submission) => (
              <div key={submission.id} className="p-4 bg-gray-800 rounded-md border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-gray-300">
                      Submission #{submission.id}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(submission.timestamp)}
                    </div>
                  </div>
                  <span 
                    className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      submission.status === 'Accepted' 
                        ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                        : submission.status === 'Wrong Answer'
                          ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Language:</span>
                    <span className="font-mono">{submission.language}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-gray-500">Runtime:</span>
                    <span className="font-mono">{typeof submission.runtime === 'number' ? `${(submission.runtime * 1000).toFixed(0)} ms` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-gray-500">Memory:</span>
                    <span className="font-mono">{typeof submission.memory === 'number' ? `${(submission.memory / 1024).toFixed(2)} MB` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render the notes content
  const renderNotesContent = () => (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Your Notes</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            {notes.length} character{notes.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={clearNotes}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
            disabled={!notes.length}
          >
            Clear All
          </button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Write your notes here..."
        className="flex-1 w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <div className="mt-2 text-xs text-gray-500">
        Notes are automatically saved to your browser's local storage.
      </div>
    </div>
  );

  // Get the content for the active tab
  const getActiveContent = () => {
    switch (activeTab) {
      case 'solutions':
        return renderSolutionContent();
      case 'submissions':
        return renderSubmissionsContent();
      case 'notes':
        return renderNotesContent();
      case 'problem':
      default:
        return (
          <>
            {renderProblemHeader()}
            {renderProblemContent()}
          </>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {renderTabs()}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
        <div className="max-w-4xl mx-auto w-full">
          {getActiveContent()}
        </div>
      </div>
      {/* Modal for code view */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={() => setSelectedSubmission(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="mb-4">
              <div className="text-lg font-semibold text-white mb-2">Submission #{selectedSubmission.id} Code</div>
              <div className="text-xs text-gray-400 mb-2">Language: <span className="font-mono">{selectedSubmission.language}</span></div>
            </div>
            <pre className="bg-gray-800 rounded p-4 text-sm text-white overflow-x-auto max-h-96">
              {selectedSubmission.code || '// Code not available'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;
