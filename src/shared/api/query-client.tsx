"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * One QueryClient per browser session, created inside the provider.
 *
 * Deliberately *not* a module-level singleton. A `"use client"` module is still
 * evaluated on the server during SSR, so a client shared at module scope is
 * created once per Node process and shared by every concurrent render — one
 * visitor's catalogue results would seed the next visitor's cache. Creating it
 * in `useState` gives each render tree its own, and the browser keeps a single
 * one across navigations because the provider is mounted in the root layout.
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function ApiQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(createQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export type ApiQueryOptions<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;

export function createApiQueryOptions<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: ApiQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  return {
    queryKey,
    queryFn,
    ...options,
  };
}
