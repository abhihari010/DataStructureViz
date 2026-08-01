import api from "@/lib/api";

export interface ProgressProblem {
  problemId: number;
  title: string;
  difficulty: string;
  topicId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | string;
  completed: boolean;
  draftCode: string | null;
  draftLanguage: string | null;
  timeSpentSeconds: number;
  bestRuntime: number | null;
  bestResultStatus: string | null;
  bestLanguage: string | null;
  attemptCount: number;
  lastAttemptAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
}

export interface ProgressSolution {
  id: number;
  problemId: number;
  title: string;
  code: string;
  language: string;
  passed: boolean;
  submittedAt: string;
  runtime: number | null;
  memory: number | null;
}

export interface ProgressSummary {
  totalProblems: number;
  trackedProblems: number;
  attemptedProblems: number;
  completedProblems: number;
  inProgressProblems: number;
  totalAttempts: number;
  lastActivityAt: string | null;
}

export interface ProgressAttempt {
  id: number;
  problemId: number;
  status: string;
  resultStatus: string | null;
  language: string;
  runtime: number | null;
  memory: number | null;
  attemptedAt: string;
}

export interface SaveDraftInput {
  draftCode: string;
  draftLanguage: string;
  timeSpentSeconds?: number;
}

export interface RecordOutcomeInput {
  status: string;
  resultStatus?: string;
  language: string;
  code?: string;
  receiptId?: string;
  runtime?: number;
  memory?: number;
}

export const progressQueryKeys = {
  all: ["progress"] as const,
  problems: () => ["progress", "problems"] as const,
  summary: () => ["progress", "summary"] as const,
  problem: (problemId: number) => ["progress", "problems", problemId] as const,
  attempts: (problemId: number) => ["progress", "problems", problemId, "attempts"] as const,
};

export const progressApi = {
  async getProblems(): Promise<ProgressProblem[]> {
    const response = await api.get<ProgressProblem[]>("/progress/problems");
    return response.data;
  },

  async getSummary(): Promise<ProgressSummary> {
    const response = await api.get<ProgressSummary>("/progress/summary");
    return response.data;
  },

  async getProblem(problemId: number): Promise<ProgressProblem> {
    const response = await api.get<ProgressProblem>(`/progress/problems/${problemId}`);
    return response.data;
  },

  async saveDraft(problemId: number, input: SaveDraftInput): Promise<ProgressProblem> {
    const response = await api.put<ProgressProblem>(`/progress/problems/${problemId}/draft`, input);
    return response.data;
  },

  async getAttempts(problemId: number): Promise<ProgressAttempt[]> {
    const response = await api.get<ProgressAttempt[]>(`/progress/problems/${problemId}/attempts`);
    return response.data;
  },

  async getSolutions(): Promise<ProgressSolution[]> {
    const response = await api.get<ProgressSolution[]>("/solutions");
    return response.data;
  },

  async recordOutcome(problemId: number, input: RecordOutcomeInput): Promise<ProgressProblem> {
    const response = await api.post<ProgressProblem>(`/progress/problems/${problemId}/attempts`, input);
    return response.data;
  },
};

export default progressApi;
