/// <reference types="vite/client" />
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/** Convert legacy React Query keys into paths relative to the API base URL. */
export function toApiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const basePath = API_BASE_URL.startsWith("http")
    ? new URL(API_BASE_URL).pathname
    : API_BASE_URL;
  const normalizedBasePath = basePath.replace(/\/$/, "");

  if (normalizedBasePath && path.startsWith(`${normalizedBasePath}/`)) {
    return path.slice(normalizedBasePath.length) || "/";
  }

  // Keep old query keys working while callers move to canonical paths.
  if (path.startsWith("/api/")) return path.slice("/api".length);
  return path;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    const url = config.url || "";

    // Exclude Authorization header for specific endpoints
    const excludeAuthEndpoints = [
      "/auth/register",
      "/auth/login",
      "/auth/verify",
      "/auth/resend-verification",
      "/forgot-password",
    ];

    const shouldExclude = excludeAuthEndpoints.some((endpoint) =>
      url.includes(endpoint),
    );

    if (token && !shouldExclude) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response || !error.config) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const url = error.config.url || "";

    if (status === 401 || status === 403) {
      // These are endpoints where a 401/403 is an expected failure message for a form,
      // not an indicator of an invalid session.
      const isFormSubmissionEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/change-password");

      if (!isFormSubmissionEndpoint) {
        // For all other 401/403 errors (including on /auth/user), the token is invalid/expired.
        localStorage.removeItem("jwt_token");
        const returnUrl = window.location.pathname + window.location.search;
        if (returnUrl !== "/login") {
          sessionStorage.setItem("returnUrl", returnUrl);
        }
        window.location.href = "/login";
        return Promise.reject({ ...error, isAuthError: true });
      }
    }

    // For all other errors, or for 401s on form submissions, just reject so the UI can handle it.
    return Promise.reject(error);
  },
);

// Auth endpoints
export const auth = {
  register: (data: RegisterRequest) => api.post("/auth/register", data),
  login: (data: LoginRequest) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),

  getCurrentUser: () => api.get<User>("/auth/user"),
  verifyEmail: (token: string) =>
    api.get<ResetMessage>("/auth/verify", { params: { token } }),
  resendVerification: (email: string) =>
    api.post<ResetMessage>("/auth/resend-verification", null, { params: { email } }),
  updateProfile: (data: ProfileUpdateRequest) => api.patch("/auth/profile", data),
  changePassword: (data: ChangePasswordRequest) =>
    api.post("/auth/change-password", data),
  deleteAccount: () => api.post("/auth/delete-account"),
};

export const passwordReset = {
  request: (email: string) =>
    api.post<ResetMessage>(`/forgot-password/sendMail/${encodeURIComponent(email)}`),
  verifyOtp: (email: string, otp: string) =>
    api.post<ResetProofResponse>(
      `/forgot-password/verifyOtp/${encodeURIComponent(otp)}/${encodeURIComponent(email)}`,
    ),
  reset: (email: string, data: ResetPasswordRequest) =>
    api.post<ResetMessage>(
      `/forgot-password/changePassword/${encodeURIComponent(email)}`,
      data,
    ),
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data;
    if (typeof response?.message === "string") {
      return response.message;
    }
  }
  return fallback;
}

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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  repeatPassword: string;
  resetProof: string;
}

export interface ResetMessage {
  message: string;
}

export interface ResetProofResponse extends ResetMessage {
  resetProof: string;
  expiresAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  profileImageUrl?: string;
}

export interface UserProgress {
  id: number;
  userId: string;
  topicId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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
    runtime?: number;
    memory?: number;
  }) => {
    const response = await api.post("/solutions", data);
    return response.data;
  },
};
