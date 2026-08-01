import axios from 'axios';
import api from '@/lib/api';

export interface Example {
  id?: number;
  input: string;
  output: string;
  explanation?: string;
}

export interface Constraint {
  id: string;
  constraint: string;
}

export interface MethodSignature {
  parameters: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  returnType: string;
  description?: string;
}

export interface PracticeProblem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicId: string;
  examples?: Example[];
  boilerPlateCode?: string;
  createdAt: string;
  topic?: string;
  constraints?: Constraint[];
  methodSignature?: MethodSignature;
}

export const getProblemById = async (id: number): Promise<PracticeProblem> => {
  try {
    const response = await api.get<PracticeProblem>(`/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching problem:', error);
    throw error;
  }
};

export const getProblemsByTopic = async (topicId: string): Promise<PracticeProblem[]> => {
  try {
    const response = await api.get<PracticeProblem[]>('/problems', { params: { topicId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching problems by topic:', error);
    throw error;
  }
};

export const getAllProblems = async (): Promise<PracticeProblem[]> => {
  try {
    const response = await api.get<PracticeProblem[]>('/problems');
    return response.data;
  } catch (error) {
    console.error('Error fetching all problems:', error);
    throw error;
  }
};

export interface TestCaseResult {
  case_number: number;
  stdin:      string;
  stdout:     string;
  stderr?:    string;
  passed:     boolean;
}

export interface ExecuteCodeRequest {
  code: string;
  language: string;
  problemId: number;
}

export interface ExecuteCodeResponse {
  contract_version: 'v1' | string;
  receipt?: ExecutionReceipt;
  status: ExecutionStatus;
  failure_code?: string;
  success: boolean;
  output?: string;
  error?: string;
  message?: string;
  passed: boolean;
  runtime?: number;
  memory?: number;
  results?: TestCaseResult[];
  test_case_results?: TestCaseResult[];
}

export type ExecutionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'PROBLEM_NOT_FOUND'
  | 'NO_TEST_CASES'
  | 'PROVIDER_ERROR'
  | 'PROVIDER_QUOTA'
  | 'INTERNAL_ERROR'
  | string;

export interface ExecutionReceipt {
  receipt_id: string;
}

export class ExecutionRequestError extends Error {
  readonly code: ExecutionStatus;
  readonly httpStatus?: number;
  readonly retryable: boolean;

  constructor(message: string, code: ExecutionStatus = 'INTERNAL_ERROR', httpStatus?: number) {
    super(message);
    this.name = 'ExecutionRequestError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.retryable = code === 'RATE_LIMITED' || code === 'PROVIDER_ERROR' || code === 'PROVIDER_QUOTA';
  }
}

export const executeCode = async (request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> => {
  try {
    const response = await api.post<ExecuteCodeResponse>('/execute', request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ExecuteCodeResponse>(error)) {
      const payload = error.response?.data;
      throw new ExecutionRequestError(
        payload?.message || payload?.error || 'Code execution failed. Please try again.',
        payload?.status || (error.response?.status === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR'),
        error.response?.status,
      );
    }
    throw new ExecutionRequestError('Code execution failed. Please try again.');
  }
};

export async function submitSolutionApi({
  code,
  language,
  problemId,
  receiptId,
  runtime,
  memory,
}: {
  code: string;
  language: string;
  problemId: number;
  receiptId: string;
  runtime?: number;
  memory?: number;
}) {
  const response = await api.post('/solutions', {
    problemId,
    code,
    language,
    receipt_id: receiptId,
    runtime,
    memory,
  });
  return response.data;
}

