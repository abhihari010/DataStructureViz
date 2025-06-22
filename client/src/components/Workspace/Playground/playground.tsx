import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, Settings, Terminal, X } from 'lucide-react';

type Language = 'javascript' | 'python' | 'java' | 'cpp';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

interface PlaygroundProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  isRunning: boolean;
  consoleOutput?: string;
  onClearConsole?: () => void;
}

const Playground: React.FC<PlaygroundProps> = ({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  isRunning,
  consoleOutput = '',
  onClearConsole = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'console'>('code');
  const [localConsoleOutput, setLocalConsoleOutput] = useState<string>('');
  
  // Sync with parent's console output if provided
  useEffect(() => {
    if (consoleOutput !== undefined) {
      setLocalConsoleOutput(consoleOutput);
    }
  }, [consoleOutput]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    // Focus the editor
    editor.focus();
  };

  const handleRunCode = async () => {
    if (isRunning) return;

    setActiveTab('console');
    const newOutput = 'Running code...\n';
    setLocalConsoleOutput(newOutput);

    // In a real implementation, this would execute the code and show the output
    // For now, we'll just simulate it
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const output = 'Code executed successfully!\n\nNote: This is a simulation. In a real implementation, this would show the actual output.';
      setLocalConsoleOutput(prev => prev + output);
    } catch (error) {
      const errorMsg = 'Error: ' + (error instanceof Error ? error.message : 'Unknown error');
      setLocalConsoleOutput(prev => prev + errorMsg);
    }
  };
  
  const handleClearConsole = () => {
    setLocalConsoleOutput('');
    onClearConsole();
  };

  const handleSubmit = () => {
    // Add submission logic here
    setActiveTab('console');
    setLocalConsoleOutput('Submitting your solution...\n');

    setTimeout(() => {
      setLocalConsoleOutput(prev => prev + '✓ Solution submitted successfully!');
    }, 1000);
  };

  const handleEditorChange = (value: string | undefined) => {
    onCodeChange(value || '');
  };

  const handleLanguageChange = (language: string) => {
    onLanguageChange(language);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
              isRunning
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Play size={14} className="mr-1.5" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-blue-800 disabled:text-blue-300"
          >
            <Send size={14} />
            <span>Submit</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-[#3e3e42] text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isRunning}
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleClearConsole}
            disabled={isRunning}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
            title="Clear console"
          >
            <X size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-white">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Editor and Console Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-gray-700 bg-[#252526]">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'code'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Solution.{language}
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-4 py-2 text-sm font-medium flex items-center space-x-1 ${
              activeTab === 'console'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Terminal size={14} />
            <span>Console</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'code' ? (
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 10 },
              }}
            />
          ) : (
            <div 
              ref={consoleRef}
              className="h-full bg-[#1e1e1e] p-4 font-mono text-sm text-gray-200 overflow-auto whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: localConsoleOutput ? 
                  localConsoleOutput.replace(/\n/g, '<br>') : 
                  'Run your code to see the output here...' 
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { Playground };
export type { PlaygroundProps };
