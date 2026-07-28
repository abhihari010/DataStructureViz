import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/app-shell";
import Reveal from "@/components/reveal";
import { getAllProblems, type PracticeProblem } from "@/services/problemService";

const topicNames: Record<string, string> = {
  stack: "Stack",
  queue: "Queue",
  "linked-list": "Linked list",
  "binary-tree": "Binary tree",
  graph: "Graph",
  array: "Array / HashMap",
};

export default function PracticePage() {
  const [query, setQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") || "",
  );
  const { data: problems = [], isLoading } = useQuery<PracticeProblem[]>({
    queryKey: ["allProblems"],
    queryFn: getAllProblems,
  });
  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) =>
        `${problem.title} ${problem.description || ""} ${problem.topicId}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [problems, query],
  );
  const grouped = filteredProblems.reduce<Record<string, PracticeProblem[]>>(
    (result, problem) => {
      (result[problem.topicId] ||= []).push(problem);
      return result;
    },
    {},
  );

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
            Choose a problem by structure, inspect its constraints, and solve it
            in the full coding workspace.
          </p>
        </header>

        <div className="app-index-tools">
          <label className="app-index-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search practice problems</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search problems…"
            />
          </label>
          <span className="app-result-count">
            {filteredProblems.length} problem{filteredProblems.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <div className="app-inline-state" role="status">Loading the practice ledger…</div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="app-practice-groups">
            {Object.entries(grouped).map(([topicId, topicProblems], groupIndex) => (
              <Reveal key={topicId} delay={Math.min(groupIndex, 4) * 0.06}>
              <section>
                <header>
                  <h2>{topicNames[topicId] || topicId}</h2>
                  <span>{topicProblems.length} entries</span>
                </header>
                <ol>
                  {topicProblems.map((problem, index) => (
                    <li key={problem.id}>
                      <Link href={`/problems/${problem.id}`}>
                        <span className="app-problem-row-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <strong>{problem.title}</strong>
                          <p>{problem.description}</p>
                        </div>
                        <span className="app-difficulty">{problem.difficulty}</span>
                        <span className="app-problem-action">
                          Solve
                          <ArrowRight aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="app-inline-state">
            No practice problems match “{query}”.
          </div>
        )}
      </div>
    </AppShell>
  );
}
