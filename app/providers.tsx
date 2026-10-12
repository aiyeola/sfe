'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ApiError } from '@/lib/api/client'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // One silent retry absorbs the API's random 500s. 4xx (e.g. 404) won't change on retry.
        retry: (failureCount, error) =>
          failureCount < 1 && !(error instanceof ApiError && error.status < 500),
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  // A fresh client per server render keeps requests isolated; the browser keeps one for its cache.
  if (typeof window === 'undefined') return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
}
