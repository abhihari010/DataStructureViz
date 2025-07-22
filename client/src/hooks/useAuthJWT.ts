import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  auth,
  type User,
  type LoginRequest,
  type RegisterRequest,
} from "@/lib/api";
import { AxiosResponse } from "axios";
import { useLocation } from "wouter";

interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function useAuthJWT() {
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const [location, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwt_token")
  );
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await auth.getCurrentUser();
      return response.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const loginMutation = useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      try {
        const response = await auth.login(credentials);
        return response.data;
      } catch (error: any) {
        // Re-throw the error with the response data
        const errorMessage =
          error.response?.data?.message ||
          "Login failed. Please check your credentials.";
        const errorWithResponse = new Error(errorMessage);
        (errorWithResponse as any).response = error.response;
        throw errorWithResponse;
      }
    },
    onMutate: () => {
      setIsAuthTransitioning(true);
    },
    onSuccess: (data) => {
      localStorage.setItem("jwt_token", data.token);
      setToken(data.token);
      // Optimistically set the user in the React Query cache
      queryClient.setQueryData(["/api/auth/user"], {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Check for return URL in session storage
      const returnUrl = sessionStorage.getItem("returnUrl");
      if (returnUrl) {
        sessionStorage.removeItem("returnUrl");
        window.location.href = returnUrl; // Use window.location for full page reload
      } else {
        setLocation("/");
      }

      setTimeout(() => setIsAuthTransitioning(false), 600);
    },
    onError: (error) => {
      setIsAuthTransitioning(false);
      // Don't throw here, let the component handle the error
    },
  });

  // Create a wrapper function that returns a promise
  const login = async (credentials: LoginRequest) => {
    try {
      setIsAuthTransitioning(true);
      const result = await loginMutation.mutateAsync(credentials);

      // Set token first
      localStorage.setItem("jwt_token", result.token);
      setToken(result.token);

      // Update user data in cache
      queryClient.setQueryData(["/api/auth/user"], {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
      });

      // Force a refetch to ensure we have fresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Handle navigation
      const returnUrl = sessionStorage.getItem("returnUrl");
      if (returnUrl) {
        sessionStorage.removeItem("returnUrl");
        window.location.href = returnUrl;
      } else {
        setLocation("/");
      }

      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsAuthTransitioning(false);
    }
  };

  const registerMutation = useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (userData) => {
      const response = await auth.register(userData);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("jwt_token", data.token);
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    queryClient.clear();
    window.location.href = "/"; // Redirect to landing page after logout
  };

  return {
    isAuthTransitioning,
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
