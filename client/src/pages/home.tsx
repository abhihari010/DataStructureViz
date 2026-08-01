import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Clock3, Play, TimerReset } from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/app-shell";
import CountUp from "@/components/count-up";
import Reveal from "@/components/reveal";
import {
  useProgressProblems,
  useProgressSolutions,
  useProgressSummary,
} from "@/features/progress/progressHooks";
import {
  formatLastAttempt,
  formatRuntime,
  formatTimeSpent,
  getLearnerProblemStatus,
  getStatusLabel,
} from "@/features/progress/progressPresentation";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { getAllProblems, type PracticeProblem } from "@/services/problemService";

export default function Home() {
  const { user } = useAuthJWT();
  const problemsQuery = useQuery<PracticeProblem[]>({
    queryKey: ["allProblems"],
    queryFn: getAllProblems,
  });
  const progressQuery = useProgressProblems();
  const summaryQuery = useProgressSummary();
  const solutionsQuery = useProgressSolutions();
  const progressByProblemId = useMemo(
    () => new Map((progressQuery.data || []).map((item) => [item.problemId, item])),
    [progressQuery.data],
  );
  const problems = problemsQuery.data || [];
  const trackedProblems = useMemo(
    () => problems.map((problem) => ({
      problem,
      progress: progressByProblemId.get(problem.id),
      status: getLearnerProblemStatus(progressByProblemId.get(problem.id), solutionsQuery.data),
    })),
    [problems, progressByProblemId, solutionsQuery.data],
  );
  const solvedCount = trackedProblems.filter((item) => item.status === "solved").length;
  const totalProblems = summaryQuery.data?.totalProblems || problems.length;
  const percent = totalProblems ? Math.round((solvedCount / totalProblems) * 100) : 0;
  const totalTime = (progressQuery.data || []).reduce(
    (sum, item) => sum + (item.timeSpentSeconds || 0),
    0,
  );
  const continueItem = trackedProblems.find(
    (item) => item.status === "in-progress" || item.status === "attempted",
  ) || trackedProblems.find((item) => item.status !== "solved");
  const visibleItems = trackedProblems
    .filter((item) => item.status !== "not-started" || item.progress)
    .sort((left, right) => {
      const leftTime = left.progress?.lastAttemptAt || left.progress?.updatedAt || "";
      const rightTime = right.progress?.lastAttemptAt || right.progress?.updatedAt || "";
      return rightTime.localeCompare(leftTime);
    })
    .slice(0, 12);
  const isLoading = problemsQuery.isLoading || progressQuery.isLoading || summaryQuery.isLoading || solutionsQuery.isLoading;
  const error = problemsQuery.error || progressQuery.error || summaryQuery.error || solutionsQuery.error;
  const firstName = (user as { firstName?: string } | null)?.firstName || "learner";

  return (
    <AppShell>
      <div className="app-dashboard">
        <header className="app-dashboard-hero">
          <div>
            <span className="app-kicker">Your execution ledger</span>
            <h1>Keep going,<br />{firstName}.</h1>
            <p>
              Return to a saved draft, inspect the latest result, or pick the next
              unresolved problem from your practice path.
            </p>
          </div>

          <div className="app-dashboard-progress" aria-label={`${percent}% practice complete`}>
            <span>Practice resolved</span>
            <strong><CountUp value={percent} suffix="%" pad={2} /></strong>
            <div className="app-dashboard-progress-track">
              <i style={{ transform: `scaleX(${percent / 100})` }} />
            </div>
            <small>{solvedCount} of {totalProblems || "—"} problems solved</small>
            <div className="app-ambient-trace" aria-hidden="true"><i /></div>
            <div className="app-progress-caption"><span>{summaryQuery.data?.totalAttempts || 0} attempts</span><span>server-verified activity</span></div>
          </div>
        </header>

        {isLoading ? (
          <div className="app-inline-state" role="status">Loading your progress ledger…</div>
        ) : error ? (
          <div className="app-inline-state app-inline-state-error" role="alert">
            Your progress could not be loaded. Refresh and try again.
          </div>
        ) : (
          <>
            <Reveal>
              <section className="app-continue-band">
                <div className="app-continue-copy">
                  <span className="app-kicker">Continue from here</span>
                  <h2>{continueItem?.problem.title || "Practice ledger"}</h2>
                  <p>
                    {continueItem?.status === "in-progress"
                      ? "Your draft and active time are saved. Resume where you left off."
                      : continueItem?.status === "attempted"
                        ? "Review your latest attempt and keep working toward a trusted submission."
                        : "Choose a problem to start building persisted practice evidence."}
                  </p>
                </div>
                {continueItem ? (
                  <>
                    <div className="app-continue-meta">
                      <span><Clock3 aria-hidden="true" /> {formatTimeSpent(continueItem.progress?.timeSpentSeconds)} recorded</span>
                      <span><TimerReset aria-hidden="true" /> {getStatusLabel(continueItem.status)}</span>
                    </div>
                    <Link className="app-primary-command" href={`/problems/${continueItem.problem.id}`}>
                      <Play aria-hidden="true" />
                      {continueItem.status === "in-progress" || continueItem.status === "attempted" ? "Resume problem" : "Start practice"}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </>
                ) : (
                  <Link className="app-primary-command" href="/practice">
                    <Play aria-hidden="true" /> Browse practice <ArrowRight aria-hidden="true" />
                  </Link>
                )}
              </section>
            </Reveal>

            <Reveal className="app-dashboard-ledger">
              <div className="app-ledger-heading">
                <div>
                  <span className="app-kicker">Recent practice</span>
                  <h2>Every result leaves a trace.</h2>
                </div>
                <div className="app-ledger-totals">
                  <span><Check aria-hidden="true" /> {solvedCount} solved</span>
                  <span><TimerReset aria-hidden="true" /> {formatTimeSpent(totalTime)} recorded</span>
                </div>
              </div>

              {visibleItems.length > 0 ? (
                <ol className="app-learning-ledger">
                  {visibleItems.map(({ problem, progress, status }, index) => {
                    const solution = solutionsQuery.data?.find(
                      (item) => item.problemId === problem.id && item.passed,
                    );
                    const runtime = progress?.bestRuntime ?? solution?.runtime;
                    const resultStatus = progress?.bestResultStatus || (solution ? "ACCEPTED" : null);
                    const language = progress?.bestLanguage || solution?.language;
                    return (
                      <li key={problem.id}>
                        <Link href={`/problems/${problem.id}`}>
                          <span className="app-learning-ledger-index">{String(index + 1).padStart(2, "0")}</span>
                          <div>
                            <strong>{problem.title}</strong>
                            <small>{problem.difficulty} · {formatLastAttempt(progress?.lastAttemptAt || solution?.submittedAt)}</small>
                          </div>
                          <span className="app-learning-ledger-time">{resultStatus || "—"} · {language || "—"}</span>
                          <span className={`app-learning-ledger-state is-${status}`}>
                            {getStatusLabel(status)} · {formatRuntime(runtime)}
                          </span>
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="app-inline-state">
                  No problem activity yet. Open the practice ledger to begin.
                </div>
              )}
            </Reveal>
          </>
        )}
      </div>
    </AppShell>
  );
}
