import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Code, Maximize2, Minimize2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const defaultCodeExamples = {
  javascript: "// No code example available",
  python: "# No code example available",
};

type CodePanelProps = {
  codeExamples?: Record<string, string>;
};

const MAX_VISIBLE_LINES = 24;

export default function CodePanel({
  codeExamples = defaultCodeExamples,
}: CodePanelProps) {
  const availableLanguages = Object.keys(codeExamples);
  const [selectedLanguage, setSelectedLanguage] = useState(
    availableLanguages[0] || "javascript",
  );
  const [expanded, setExpanded] = useState(false);
  const safeLanguage = availableLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : availableLanguages[0] || "javascript";
  const codeLines = useMemo(
    () => (codeExamples[safeLanguage] || "").split("\n"),
    [codeExamples, safeLanguage],
  );
  const canExpand = codeLines.length > MAX_VISIBLE_LINES;
  const visibleLines = expanded ? codeLines : codeLines.slice(0, MAX_VISIBLE_LINES);

  useEffect(() => {
    if (selectedLanguage !== safeLanguage) {
      setSelectedLanguage(safeLanguage);
    }
    setExpanded(false);
  }, [safeLanguage, selectedLanguage]);

  return (
    <div className="app-code-panel">
      <div className="app-code-panel-header">
        <div className="app-code-panel-title">
          <Code aria-hidden="true" />
          <span>Implementation</span>
        </div>

        <div className="app-code-panel-controls">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="app-code-language">
                {safeLanguage.toUpperCase()}
                <ChevronDown aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableLanguages.map((language) => (
                <DropdownMenuItem
                  key={language}
                  onClick={() => setSelectedLanguage(language)}
                >
                  {language === safeLanguage && <Check aria-hidden="true" />}
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            className="app-code-expand"
            onClick={() => setExpanded((value) => !value)}
            disabled={!canExpand}
            aria-label={expanded ? "Collapse code" : "Expand code"}
          >
            {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        className="app-code-content"
        key={safeLanguage}
        aria-label={`${safeLanguage} implementation code`}
      >
        {visibleLines.map((line, index) => (
          <div className="app-code-line" key={`${index}-${line}`}>
            <span className="app-code-line-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <code>{line || " "}</code>
          </div>
        ))}

        {canExpand && (
          <button
            type="button"
            className="app-code-more"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            {expanded
              ? "Show fewer lines"
              : `Show ${codeLines.length - MAX_VISIBLE_LINES} more lines`}
          </button>
        )}
      </div>
    </div>
  );
}
