import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Solution } from "@/services/problemService";

// Simple code block component with syntax highlighting
const CodeBlock = ({ 
  language, 
  code,
  className 
}: { 
  language: string; 
  code: string;
  className?: string;
}) => {
  return (
    <div className={cn("relative bg-[#1E1E1E] rounded-b-md overflow-hidden border border-gray-700", className)}>
      <div className="px-4 py-2 text-xs text-gray-300 bg-[#252526] border-b border-gray-600 font-mono">
        {language}
      </div>
      <pre className="m-0 p-4 text-sm overflow-x-auto">
        <code className={`language-${language} block text-gray-200`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  java: 'Java',
  javascript: 'JavaScript',
  python: 'Python',
  cpp: 'C++'
};

interface SolutionPanelProps {
  solutions: {
    [key: string]: Solution;
  };
  timeComplexity?: {
    [key: string]: string;
  };
  spaceComplexity?: {
    [key: string]: string;
  };
  className?: string;
}

export default function SolutionPanel({ 
  solutions, 
  timeComplexity = {},
  spaceComplexity = {},
  className = "" 
}: SolutionPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(Object.keys(solutions)[0] || '');
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to handle server-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on the server
  if (!isMounted) {
    return null;
  }

  // Handle copy to clipboard
  const handleCopy = () => {
    if (activeSolution) {
      navigator.clipboard.writeText(activeSolution.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (Object.keys(solutions).length === 0) {
    return (
      <Card className={cn("border border-gray-200 dark:border-gray-800", className)}>
        <CardHeader>
          <CardTitle>No solutions available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <p>No solutions have been added for this problem yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const solutionLanguages = Object.keys(solutions);
  const activeSolution = solutions[activeTab] || solutions[solutionLanguages[0]];

  return (
    <Card className={cn("border border-gray-200 dark:border-gray-800 overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Solution</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start rounded-none border-b border-gray-200 bg-transparent p-0 dark:border-gray-800">
          {Object.keys(solutions).map((lang) => (
            <TabsTrigger
              key={lang}
              value={lang}
              className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-gray-500 shadow-none transition-none hover:text-gray-900 hover:bg-gray-100 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:data-[state=active]:text-gray-50"
            >
              {LANGUAGE_NAMES[lang] || lang}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(solutions).map(([lang, solution]) => (
          <TabsContent key={lang} value={lang} className="m-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time Complexity</p>
                  <p className="font-mono text-sm">
                    {timeComplexity[lang] || solution.timeComplexity || 'O(n)'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Space Complexity</p>
                  <p className="font-mono text-sm">
                    {spaceComplexity[lang] || solution.spaceComplexity || 'O(n)'}
                  </p>
                </div>
              </div>
              <CodeBlock 
                language={lang} 
                code={solution.code} 
                className="rounded-t-none border-t-0" 
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
