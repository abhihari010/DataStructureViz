import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Code, Maximize2, Minimize2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Default code examples if none provided
const defaultCodeExamples = {
  javascript: `// No code example available
// Please provide code examples as a prop`,
  python: `# No code example available
# Please provide code examples as a prop`
};

interface CodePanelProps {
  codeExamples?: {
    [key: string]: string;
  };
}

// Show more lines by default before showing the expand button
const MAX_VISIBLE_LINES = 18;

export default function CodePanel({ 
  codeExamples = defaultCodeExamples
}: CodePanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const codeContentRef = useRef<HTMLDivElement>(null);

  // Get available languages from the provided examples
  const availableLanguages = Object.keys(codeExamples);
  
  // Ensure selectedLanguage exists in available languages, otherwise use the first one
  const safeSelectedLanguage = availableLanguages.includes(selectedLanguage) 
    ? selectedLanguage 
    : availableLanguages[0] || 'javascript';
  
  // Update selected language if it's not valid
  useEffect(() => {
    if (selectedLanguage !== safeSelectedLanguage) {
      setSelectedLanguage(safeSelectedLanguage);
    }
  }, [selectedLanguage, safeSelectedLanguage]);
  
  // Check if code exceeds max visible lines
  useEffect(() => {
    if (codeContentRef.current && codeExamples[safeSelectedLanguage]) {
      const lineCount = codeExamples[safeSelectedLanguage].split('\n').length;
      setShowExpandButton(lineCount > MAX_VISIBLE_LINES);
    }
  }, [safeSelectedLanguage, codeExamples]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatCode = (code: string) => {
    return code.split('\n').map((line, index) => (
      <div key={index} className="relative">
        <span className="text-gray-500 select-none mr-4 text-xs">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <span className="font-code text-sm">
          {line.replace(/^\s*/, (match) => '\u00A0'.repeat(match.length))}
        </span>
      </div>
    ));
  };

  const codeLines = (codeExamples[safeSelectedLanguage] || '').split('\n');
  const visibleCode = isExpanded 
    ? codeLines 
    : codeLines.slice(0, MAX_VISIBLE_LINES);

  return (
    <Card className="h-full flex flex-col w-full flex-shrink-0 code-panel">
      {/* Code Header */}
      <CardHeader className="border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium">Implementation</CardTitle>
          </div>
          
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  {safeSelectedLanguage.toUpperCase()}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {availableLanguages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={lang === safeSelectedLanguage ? 'bg-gray-100' : ''}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={toggleExpand}
              disabled={!showExpandButton}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Code Content */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div 
          ref={codeContentRef}
          className={`p-4 bg-slate-900 text-gray-100 font-mono text-sm leading-relaxed overflow-auto h-full transition-all duration-300 ${
            !isExpanded && showExpandButton ? 'max-h-[500px]' : 'h-full'
          }`}
        >
          <div className="space-y-0.5">
            {formatCode(visibleCode.join('\n'))}
            {showExpandButton && (
              <div 
                className={`text-center py-2 px-4 text-xs ${
                  isExpanded 
                    ? 'text-blue-400 hover:text-blue-500' 
                    : 'text-blue-400'
                } bg-blue-50 dark:bg-blue-900/30 rounded-md mx-2 mb-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center space-x-1`}
                onClick={toggleExpand}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Show {codeLines.length - MAX_VISIBLE_LINES} more lines</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>


    </Card>
  );
}
