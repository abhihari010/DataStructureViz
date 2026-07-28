import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Activity, ArrowRight, Gauge, Timer } from "lucide-react";
import AppShell from "@/components/app-shell";
import CodePanel from "@/components/code-panel";
import PracticeSection from "@/components/practice-section";

type ComplexityItem = {
  label: string;
  value: string;
};

type TopicWorkspaceProps = {
  category: string;
  children: ReactNode;
  codeExamples: Record<string, string>;
  complexity?: ComplexityItem[];
  difficulty: string;
  overview?: string;
  summary: string;
  title: string;
  topicId?: string;
};

export default function TopicWorkspace({
  category,
  children,
  codeExamples,
  complexity = [],
  difficulty,
  overview,
  summary,
  title,
  topicId,
}: TopicWorkspaceProps) {
  return (
    <AppShell>
      <article className="app-topic-page">
        <header className="app-topic-header">
          <div>
            <span className="app-kicker">{category}</span>
            <h1>{title}</h1>
            <p>{summary}</p>
          </div>
          <div className="app-topic-level">
            <Gauge aria-hidden="true" />
            <span>{difficulty}</span>
          </div>
        </header>

        <div className="app-workbench-intro" aria-hidden="true">
          <span><i /> Live trace / step by step</span>
          <span>state <b>→</b> code <b>→</b> intuition</span>
        </div>

        <div className="app-workbench">
          <section className="app-code-bay" aria-label={`${title} implementation`}>
            <CodePanel codeExamples={codeExamples} />
          </section>

          <section className="app-visual-bay" aria-label={`${title} visualization`}>
            <div className="app-bay-header">
              <div>
                <Activity aria-hidden="true" />
                <span>Live state</span>
              </div>
              <span className="app-live-indicator">Interactive</span>
            </div>
            <div className="app-visual-stage">{children}</div>
          </section>
        </div>

        {(overview || complexity.length > 0) && (
          <section className="app-topic-notes">
            <div className="app-topic-overview">
              <span className="app-kicker">Working notes</span>
              <h2>What to watch while it runs</h2>
              <p>{overview}</p>
            </div>
            <dl className="app-complexity-ledger">
              {complexity.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {topicId && (
          <section className="app-practice-bay">
            <div className="app-section-heading">
              <div>
                <span className="app-kicker">Apply the structure</span>
                <h2>Practice from this point</h2>
              </div>
              <div className="app-section-mark" aria-hidden="true">
                <Timer />
                <ArrowRight />
              </div>
            </div>
            <ErrorBoundary
              fallback={
                <div className="app-inline-state">
                  Practice material could not be loaded.
                </div>
              }
            >
              <PracticeSection topicId={topicId} />
            </ErrorBoundary>
          </section>
        )}
      </article>
    </AppShell>
  );
}
