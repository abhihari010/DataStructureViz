import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface PracticeProblem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicId: string;
  testCases: string;
  solution?: string;
  boilerPlateCode?: string;
  createdAt: string;
  topic?: string;
}

export const getProblemById = async (id: number): Promise<PracticeProblem> => {
  try {
    const response = await axios.get<PracticeProblem>(`${API_BASE_URL}/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching problem:', error);
    throw error;
  }
};

export const getProblemsByTopic = async (topicId: string): Promise<PracticeProblem[]> => {
  try {
    const response = await axios.get<PracticeProblem[]>(`${API_BASE_URL}/problems?topicId=${topicId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching problems by topic:', error);
    throw error;
  }
};

export const getAllProblems = async (): Promise<PracticeProblem[]> => {
  try {
    const response = await axios.get<PracticeProblem[]>(`${API_BASE_URL}/problems`);
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
  success: boolean;
  output: string;
  error?: string;
  passed: boolean;
  results?: TestCaseResult[];
  test_case_results?: TestCaseResult[];
}

export const executeCode = async (request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> => {
  try {
    const response = await axios.post<ExecuteCodeResponse>(
      `${API_BASE_URL}/execute`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('Error executing code:', error);
    throw error;
  }
};
