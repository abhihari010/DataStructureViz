import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auth, type User, type LoginRequest, type RegisterRequest } from "@/lib/api";
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await auth.getCurrentUser();
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await auth.login(credentials);
      return response.data;
    },
    onMutate: () => {
      setIsAuthTransitioning(true);
    },
    onSuccess: (data) => {
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      // Optimistically set the user in the React Query cache
      queryClient.setQueryData(["/api/auth/user"], {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation('/');
      setTimeout(() => setIsAuthTransitioning(false), 600);
    },
  });

  const registerMutation = useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (userData) => {
      const response = await auth.register(userData);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    queryClient.clear();
    window.location.href = '/'; // Redirect to landing page after logout
  };

  return {
    isAuthTransitioning,
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}