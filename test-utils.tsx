import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing'
import type { ReactElement } from 'react'

/** Renders with a fresh, non-retrying QueryClient and an in-memory nuqs URL. */
export function renderWithProviders(
  ui: ReactElement,
  { searchParams, onUrlUpdate }: { searchParams?: string; onUrlUpdate?: OnUrlUpdateFunction } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return {
    queryClient,
    ...render(ui, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </NuqsTestingAdapter>
      ),
    }),
  }
}

/** Stubs `fetch` to answer each API path (matched by prefix, first match wins) with a JSON body. */
export function mockApi(routes: Record<string, object | ((url: URL) => unknown)>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = new URL(String(input), 'http://localhost')
    const path = url.pathname.replace(/^\/api/, '')
    const match = Object.keys(routes).find((p) => path.startsWith(p))
    if (!match) return Response.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 })
    const route = routes[match]
    const body = typeof route === 'function' ? route(url) : route
    if (body instanceof Response) return body
    return Response.json(body)
  })
}
