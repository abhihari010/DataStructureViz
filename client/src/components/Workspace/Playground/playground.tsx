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
  onRunTests?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  canSubmit?: boolean;
  isSubmitting?: boolean;
}

const Playground: React.FC<PlaygroundProps> = ({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  isRunning,
  onRunTests,
  onSubmit,
  canSubmit = true,
  isSubmitting = false,
}) => {
  const [activeTab, setActiveTab] = useState<'code'>('code');
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    // Focus the editor
    editor.focus();
  };


  const handleRunTests = async () => {
    if (isRunning) return;
    if (onRunTests) await onRunTests();
  };

  const handleSubmit = async () => {
    if (isRunning || isSubmitting) return;
    if (onSubmit) await onSubmit();
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
            onClick={handleRunTests}
            disabled={isRunning}
            className={`px-3 py-1.5 text-sm rounded-md ${
              isRunning
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Run Test Cases
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || !canSubmit || isSubmitting}
            className={`px-3 py-1.5 text-sm rounded-md ${
              isRunning || !canSubmit || isSubmitting
                ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {/* language selector */}
          <select
            value={language}
            onChange={e => onLanguageChange(e.target.value)}
            disabled={isRunning}
            className="bg-[#3e3e42] text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            {languageOptions.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button className="p-1 text-gray-400 hover:text-white" title="Settings">
            <Settings size={18} />
          </button>
          <button className="p-1 text-gray-400 hover:text-white" title="Clear console">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onMount={handleEditorDidMount}
        onChange={v => onCodeChange(v || '')}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: 14,
        }}
      />
    </div>
  );
};

export { Playground };
export type { PlaygroundProps };
