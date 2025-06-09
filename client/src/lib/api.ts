import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
        case 403:
          // Clear token and redirect to login
          localStorage.removeItem("jwt_token");
          window.location.href = "/login";
          break;

        case 422:
          console.error("Validation error:", error.response.data);
          break;
        default:
          console.error("API error:", error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (data: RegisterRequest) => api.post("/auth/register", data),
  login: (data: LoginRequest) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/user"),
};

// Types
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default api;

// Problems API
export const problemsApi = {
  getProblems: async (topicId?: string) => {
    const response = await api.get("/problems", { params: { topicId } });
    return response.data;
  },

  getProblem: async (id: number) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },
};

// Progress API
export const progressApi = {
  getUserProgress: async () => {
    const response = await api.get("/progress");
    return response.data;
  },

  getTopicProgress: async (topicId: string) => {
    const response = await api.get(`/progress/${topicId}`);
    return response.data;
  },

  updateProgress: async (data: {
    topicId: string;
    completed?: boolean;
    score?: number;
    timeSpent?: number;
  }) => {
    const response = await api.post("/progress", data);
    return response.data;
  },
};

// Solutions API
export const solutionsApi = {
  getUserSolutions: async (problemId?: number) => {
    const response = await api.get("/solutions", { params: { problemId } });
    return response.data;
  },

  saveSolution: async (data: {
    problemId: number;
    code: string;
    language: string;
    passed?: boolean;
  }) => {
    const response = await api.post("/solutions", data);
    return response.data;
  },
};
