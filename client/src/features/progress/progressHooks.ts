import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  progressApi,
  progressQueryKeys,
  type ProgressAttempt,
  type ProgressProblem,
  type ProgressSolution,
  type ProgressSummary,
  type RecordOutcomeInput,
  type SaveDraftInput,
} from "./progressApi";

export { progressQueryKeys } from "./progressApi";

export function useProgressProblems() {
  return useQuery<ProgressProblem[]>({
    queryKey: progressQueryKeys.problems(),
    queryFn: progressApi.getProblems,
  });
}

export function useProgressSummary() {
  return useQuery<ProgressSummary>({
    queryKey: progressQueryKeys.summary(),
    queryFn: progressApi.getSummary,
  });
}

export function useProgressSolutions() {
  return useQuery<ProgressSolution[]>({
    queryKey: ["userSolutions"],
    queryFn: progressApi.getSolutions,
  });
}

export function useProblemProgress(problemId: number | undefined) {
  return useQuery<ProgressProblem>({
    queryKey: problemId === undefined ? progressQueryKeys.problems() : progressQueryKeys.problem(problemId),
    queryFn: () => progressApi.getProblem(problemId as number),
    enabled: problemId !== undefined,
  });
}

export function useProblemAttempts(problemId: number | undefined) {
  return useQuery<ProgressAttempt[]>({
    queryKey: problemId === undefined ? progressQueryKeys.problems() : progressQueryKeys.attempts(problemId),
    queryFn: () => progressApi.getAttempts(problemId as number),
    enabled: problemId !== undefined,
  });
}

export function useSaveProgressDraft() {
  const queryClient = useQueryClient();
  return useMutation<ProgressProblem, unknown, { problemId: number; input: SaveDraftInput }>({
    mutationFn: ({ problemId, input }) => progressApi.saveDraft(problemId, input),
    onSuccess: (progress) => {
      queryClient.setQueryData(progressQueryKeys.problem(progress.problemId), progress);
      void queryClient.invalidateQueries({ queryKey: progressQueryKeys.problems() });
      void queryClient.invalidateQueries({ queryKey: progressQueryKeys.summary() });
    },
  });
}

export function useRecordProgressOutcome() {
  const queryClient = useQueryClient();
  return useMutation<ProgressProblem, unknown, { problemId: number; input: RecordOutcomeInput }>({
    mutationFn: ({ problemId, input }) => progressApi.recordOutcome(problemId, input),
    onSuccess: (progress) => {
      queryClient.setQueryData(progressQueryKeys.problem(progress.problemId), progress);
      void queryClient.invalidateQueries({ queryKey: progressQueryKeys.problems() });
      void queryClient.invalidateQueries({ queryKey: progressQueryKeys.summary() });
      void queryClient.invalidateQueries({ queryKey: progressQueryKeys.attempts(progress.problemId) });
    },
  });
}
