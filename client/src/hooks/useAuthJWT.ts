import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function useAuthJWT() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      return response.json();
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
  };

  // Add JWT token to API requests
  useEffect(() => {
    if (token) {
      // Override the default query function to include JWT token
      queryClient.setDefaultOptions({
        queries: {
          queryFn: async ({ queryKey }) => {
            const response = await fetch(queryKey[0] as string, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) {
              if (response.status === 401) {
                logout();
                throw new Error('Unauthorized');
              }
              throw new Error('Network response was not ok');
            }
            
            return response.json();
          },
        },
      });
    }
  }, [token, queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}