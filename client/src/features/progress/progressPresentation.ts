import type { ProgressProblem, ProgressSolution } from "./progressApi";

export type LearnerProblemStatus =
  | "not-started"
  | "in-progress"
  | "attempted"
  | "solved";

export function isServerSolved(
  progress: ProgressProblem | undefined,
  solutions: ProgressSolution[] | undefined,
): boolean {
  return Boolean(
    progress?.completed ||
      solutions?.some((solution) => solution.problemId === progress?.problemId && solution.passed),
  );
}

export function getLearnerProblemStatus(
  progress: ProgressProblem | undefined,
  solutions: ProgressSolution[] | undefined,
): LearnerProblemStatus {
  if (isServerSolved(progress, solutions)) return "solved";
  if (progress?.draftCode || (progress?.timeSpentSeconds ?? 0) > 0) return "in-progress";
  if ((progress?.attemptCount ?? 0) > 0) return "attempted";
  return "not-started";
}

export function getStatusLabel(status: LearnerProblemStatus): string {
  switch (status) {
    case "in-progress":
      return "In progress";
    case "attempted":
      return "Attempted";
    case "solved":
      return "Solved";
    default:
      return "Not started";
  }
}

export function formatRuntime(runtime: number | null | undefined): string {
  return runtime == null ? "—" : `${runtime.toFixed(runtime < 10 ? 2 : 0)} ms`;
}

export function formatTimeSpent(seconds: number | null | undefined): string {
  const totalSeconds = Math.max(0, Math.floor(seconds ?? 0));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

export function formatLastAttempt(value: string | null | undefined): string {
  if (!value) return "No attempts yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent activity";
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86_400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  if (elapsedSeconds < 604_800) return `${Math.floor(elapsedSeconds / 86_400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatTopicTag(topicId: string): string {
  return topicId
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
