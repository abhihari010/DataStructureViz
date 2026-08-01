import {
  progressApi,
  type ProgressAttempt,
  type ProgressProblem,
  type ProgressSolution,
  type ProgressSummary,
} from "./progressApi";

// Compile-time contract checks; the repository has no frontend test runner yet.
const problems: Promise<ProgressProblem[]> = progressApi.getProblems();
const summary: Promise<ProgressSummary> = progressApi.getSummary();
const attempts: Promise<ProgressAttempt[]> = progressApi.getAttempts(1);
const solutions: Promise<ProgressSolution[]> = progressApi.getSolutions();

void problems;
void summary;
void attempts;
void solutions;
