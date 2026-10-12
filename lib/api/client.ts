import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** `.catch(ignoreAbort)` swallows the rejection from an aborted request and rethrows anything else. */
export function ignoreAbort(err: unknown): void {
  if ((err as { name?: unknown } | null)?.name !== 'AbortError') throw err
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const error = (body as Partial<ApiErrorBody> | null)?.error
    throw new ApiError(
      res.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Something went wrong. Please try again.'
    )
  }
  return body as ApiSuccess<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
