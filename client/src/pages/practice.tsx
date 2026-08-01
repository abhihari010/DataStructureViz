import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/app-shell";
import Reveal from "@/components/reveal";
import { useProgressProblems, useProgressSolutions } from "@/features/progress/progressHooks";
import {
  formatLastAttempt,
  formatRuntime,
  formatTopicTag,
  getLearnerProblemStatus,
  getStatusLabel,
  type LearnerProblemStatus,
} from "@/features/progress/progressPresentation";
import { getAllProblems, type PracticeProblem } from "@/services/problemService";

const topicNames: Record<string, string> = {
  stack: "Stack",
  queue: "Queue",
  "linked-list": "Linked list",
  "binary-tree": "Binary tree",
  graph: "Graph",
  array: "Array / HashMap",
};

const statusOptions: Array<{ value: "all" | LearnerProblemStatus; label: string }> = [
  { value: "all", label: "All states" },
  { value: "in-progress", label: "In progress" },
  { value: "attempted", label: "Attempted" },
  { value: "solved", label: "Solved" },
  { value: "not-started", label: "Not started" },
];

function displayTopic(topicId: string): string {
  return topicNames[topicId] || formatTopicTag(topicId);
}

export default function PracticePage() {
  const [query, setQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") || "",
  );
  const [difficulty, setDifficulty] = useState("all");
  const [tag, setTag] = useState("all");
  const [status, setStatus] = useState<"all" | LearnerProblemStatus>("all");
  const problemsQuery = useQuery<PracticeProblem[]>({
    queryKey: ["allProblems"],
    queryFn: getAllProblems,
  });
  const progressQuery = useProgressProblems();
  const solutionsQuery = useProgressSolutions();
  const problems = problemsQuery.data || [];
  const progressByProblemId = useMemo(
    () => new Map((progressQuery.data || []).map((item) => [item.problemId, item])),
    [progressQuery.data],
  );
  const tags = useMemo(
    () => Array.from(new Set(problems.map((problem) => problem.topicId).filter(Boolean))).sort(),
    [problems],
  );

  const filteredProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return problems.filter((problem) => {
      const progress = progressByProblemId.get(problem.id);
      const learnerStatus = getLearnerProblemStatus(progress, solutionsQuery.data);
      const searchable = `${problem.title} ${problem.description || ""} ${problem.topicId}`.toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (difficulty === "all" || problem.difficulty.toLowerCase() === difficulty) &&
        (tag === "all" || problem.topicId === tag) &&
        (status === "all" || learnerStatus === status)
      );
    });
  }, [difficulty, problems, progressByProblemId, query, solutionsQuery.data, status, tag]);

  const grouped = filteredProblems.reduce<Record<string, PracticeProblem[]>>(
    (result, problem) => {
      (result[problem.topicId] ||= []).push(problem);
      return result;
    },
    {},
  );
  const isLoading = problemsQuery.isLoading || progressQuery.isLoading || solutionsQuery.isLoading;
  const error = problemsQuery.error || progressQuery.error || solutionsQuery.error;

  useEffect(() => {
    const url = new URL(window.location.href);
    query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [query]);

  return (
    <AppShell>
      <div className="app-index-page app-practice-page">
        <header className="app-index-header">
          <span className="app-kicker">Practice ledger</span>
          <h1>Turn the trace<br />into working code.</h1>
          <p>
            Choose a problem by structure, inspect its constraints, and resume your
            latest server-saved draft in the full coding workspace.
          </p>
        </header>

        <div className="app-index-tools app-practice-tools">
          <label className="app-index-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search practice problems</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search problems…"
            />
          </label>
          <div className="app-practice-filters" aria-label="Filter practice problems">
            <label>
              <span className="sr-only">Difficulty</span>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                <option value="all">All difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Tag</span>
              <select value={tag} onChange={(event) => setTag(event.target.value)}>
                <option value="all">All tags</option>
                {tags.map((item) => <option value={item} key={item}>{displayTopic(item)}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Solved state</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                {statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <span className="app-result-count">
            {filteredProblems.length} problem{filteredProblems.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <div className="app-inline-state" role="status">Loading the practice ledger…</div>
        ) : error ? (
          <div className="app-inline-state app-inline-state-error" role="alert">
            Practice progress could not be loaded. Refresh and try again.
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="app-practice-groups">
            {Object.entries(grouped).map(([topicId, topicProblems], groupIndex) => (
              <Reveal key={topicId} delay={Math.min(groupIndex, 4) * 0.06}>
                <section>
                  <header>
                    <h2>{displayTopic(topicId)}</h2>
                    <span>{topicProblems.length} entries</span>
                  </header>
                  <ol>
                    {topicProblems.map((problem, index) => {
                      const progress = progressByProblemId.get(problem.id);
                      const learnerStatus = getLearnerProblemStatus(progress, solutionsQuery.data);
                      const solution = solutionsQuery.data?.find(
                        (item) => item.problemId === problem.id && item.passed,
                      );
                      const runtime = progress?.bestRuntime ?? solution?.runtime;
                      const bestStatus = progress?.bestResultStatus || (solution ? "ACCEPTED" : null);
                      const bestLanguage = progress?.bestLanguage || solution?.language;
                      const lastAttempt = progress?.lastAttemptAt || solution?.submittedAt;
                      return (
                        <li key={problem.id}>
                          <Link href={`/problems/${problem.id}`}>
                            <span className="app-problem-row-index">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div className="app-practice-problem-copy">
                              <strong>{problem.title}</strong>
                              <p>{problem.description}</p>
                              <div className="app-progress-detail-row">
                                <span className={`app-progress-status is-${learnerStatus}`}>
                                  {learnerStatus === "solved" && <CheckCircle2 aria-hidden="true" />}
                                  {getStatusLabel(learnerStatus)}
                                </span>
                                <span>{progress?.attemptCount || 0} attempts</span>
                                <span>Last {formatLastAttempt(lastAttempt)}</span>
                              </div>
                            </div>
                            <span className="app-difficulty">{problem.difficulty}</span>
                            <span className="app-practice-result-meta">
                              <span>{bestStatus || "No result"}</span>
                              <span>{bestLanguage || "—"} · {formatRuntime(runtime)}</span>
                            </span>
                            <span className="app-problem-action">
                              {learnerStatus === "in-progress" || learnerStatus === "attempted" ? "Resume" : learnerStatus === "solved" ? "Review" : "Solve"}
                              <ArrowRight aria-hidden="true" />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="app-inline-state">
            No practice problems match the current search and filters.
          </div>
        )}
      </div>
    </AppShell>
  );
}
