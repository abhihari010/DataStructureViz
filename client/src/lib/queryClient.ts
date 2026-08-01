import { QueryClient, QueryFunction } from "@tanstack/react-query";
import api, { toApiPath } from "@/lib/api";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<unknown> {
  return api.request({
    method,
    url: toApiPath(url),
    data,
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export function getQueryFn<T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T> {
  const { on401: unauthorizedBehavior } = options;
  return async ({ queryKey }) => {
    try {
      const response = await api.get<T>(toApiPath(queryKey[0] as string));
      return response.data;
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.response?.status === 401) {
        return null as unknown as T;
      }
      throw error;
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
