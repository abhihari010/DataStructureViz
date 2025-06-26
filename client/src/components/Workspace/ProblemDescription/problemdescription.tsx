import React, { useState } from 'react';
import { BookOpen, MessageSquare, ThumbsUp, ChevronDown, ChevronRight, Play, CheckCircle, X } from 'lucide-react';

// Represents a single test case for a problem
export interface TestCase {
  input: Record<string, any> | string | number; // Input data for the test case
  expected: any; // Expected output
  explanation?: string; // Optional explanation for the test case
}

// Defines the available tabs in the problem description section
export type TabType = 'problem' | 'solutions' | 'discuss';

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
  activeTab: TabType; // The currently active tab
  onTabChange: (tab: TabType) => void; // Callback to change the active tab
}

/**
 * A purely presentational component to display the details of a programming problem.
 * It receives all data and callbacks as props and does not manage its own data fetching.
 */
const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  title,
  difficulty,
  problemStatement,
  examples,
  constraints,
  topics,
  activeTab,
  onTabChange,
}) => {
  // Local UI state
  const [expandedExample, setExpandedExample] = useState<number | null>(0); // Tracks which example is expanded
  const [likeCount, setLikeCount] = useState(42); // Example like count
  const [liked, setLiked] = useState(false); // User has liked the problem
  const [disliked, setDisliked] = useState(false); // User has disliked the problem

  // Toggles the expanded/collapsed state of an example
  const handleToggleExample = (index: number) => {
    setExpandedExample(expandedExample === index ? null : index);
  };

  // Handles the like button click
  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
      setLiked((prev) => !prev);
    } else {
      setLikeCount((prev) => prev + 1);
      setLiked((prev) => !prev);
      if (disliked) {
        setDisliked(false);
      }
    }
  };

  // Handles the dislike button click
  const handleDislike = () => {
    if (disliked) {
      setDisliked((prev) => !prev);
    } else {
      setDisliked((prev) => !prev);
      if (liked) {
        setLikeCount((prev) => prev - 1);
        setLiked((prev) => !prev);
      }
    }
  };

  // Renders the content for the currently active tab
  // Renders the content for the currently active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'problem':
        return (
          <div className="text-gray-300">
            <p className="whitespace-pre-wrap">{problemStatement}</p>

            {/* Examples Section */}
            <div className="mt-6">
              {examples.map((example, index) => (
                <div key={example.id} className="mb-4 bg-[#2d2d2d] rounded-lg p-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => handleToggleExample(index)}
                  >
                    <h3 className="font-semibold text-gray-200">Example {index + 1}</h3>
                    {expandedExample === index ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  {expandedExample === index && (
                    <div className="mt-3 text-sm">
                      <div className="mb-2">
                        <strong className="text-gray-400">Input:</strong>
                        <code className="block bg-[#1e1e1e] p-2 rounded-md mt-1 font-mono text-xs">{example.input}</code>
                      </div>
                      <div className="mb-2">
                        <strong className="text-gray-400">Output:</strong>
                        <code className="block bg-[#1e1e1e] p-2 rounded-md mt-1 font-mono text-xs">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div>
                          <strong className="text-gray-400">Explanation:</strong>
                          <p className="text-gray-400 mt-1">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints Section */}
            {constraints.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-200 mb-2">Constraints:</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  {constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'solutions':
        return <div className="text-center text-gray-400">Solutions coming soon.</div>; // Placeholder
      case 'discuss':
        return <div className="text-center text-gray-400">Discussion forum coming soon.</div>; // Placeholder
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#262626] text-white flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-100">{title}</h2>
        <div className="flex items-center mt-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              difficulty === 'Easy' ? 'bg-green-800 text-green-200' : ''
            } ${
              difficulty === 'Medium' ? 'bg-yellow-800 text-yellow-200' : ''
            } ${
              difficulty === 'Hard' ? 'bg-red-800 text-red-200' : ''
            }`}>
            {difficulty}
          </span>
          <div className="flex items-center ml-4 text-gray-400">
            <button onClick={handleLike} className={`flex items-center mr-3 hover:text-white ${liked ? 'text-green-500' : ''}`}>
              <ThumbsUp size={16} className="mr-1" /> {likeCount}
            </button>
            <button onClick={handleDislike} className={`flex items-center hover:text-white ${disliked ? 'text-red-500' : ''}`}>
              <ThumbsUp size={16} className="transform -scale-y-100" />
            </button>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center space-x-2 text-sm">
            {topics.map((topic) => (
              <span key={topic} className="text-xs bg-gray-700 px-2 py-1 rounded">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-gray-700">
        <button
          onClick={() => onTabChange('problem')}
          className={`px-4 py-2 text-sm font-medium flex items-center transition-colors ${
            activeTab === 'problem' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:bg-gray-700'
          }`}>
          <BookOpen size={16} className="mr-2" />
          Problem
        </button>

        <button
          onClick={() => onTabChange('solutions')}
          className={`px-4 py-2 text-sm font-medium flex items-center transition-colors ${
            activeTab === 'solutions' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:bg-gray-700'
          }`}>
          <BookOpen size={16} className="mr-2" />
          Solutions
        </button>
        <button
          onClick={() => onTabChange('discuss')}
          className={`px-4 py-2 text-sm font-medium flex items-center transition-colors ${
            activeTab === 'discuss' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:bg-gray-700'
          }`}>
          <MessageSquare size={16} className="mr-2" />
          Discuss
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>


    </div>
  );
};

export default ProblemDescription;