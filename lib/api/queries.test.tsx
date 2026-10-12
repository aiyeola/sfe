import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { mockApi } from '@/test-utils'
import { meQuery, rateQuery, transactionQuery, transactionsQuery, useConvert } from './queries'

const meta = { page: 1, limit: 5, total: 1, totalPages: 1 }

describe('queries', () => {
  let queryClient: QueryClient
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })
  afterEach(() => vi.restoreAllMocks())

  it('unwraps single resources from the response body', async () => {
    mockApi({
      '/me': { data: { firstName: 'Ada' } },
      '/transactions/txn_1': { data: { id: 'txn_1' } },
      '/rates': { data: { rate: 1530.25 } },
    })
    await expect(queryClient.fetchQuery(meQuery)).resolves.toEqual({ firstName: 'Ada' })
    await expect(queryClient.fetchQuery(transactionQuery('txn_1'))).resolves.toEqual({ id: 'txn_1' })
    await expect(queryClient.fetchQuery(rateQuery('USD', 'NGN'))).resolves.toEqual({ rate: 1530.25 })
  })

  it('keeps pagination meta for transaction lists', async () => {
    mockApi({ '/transactions': { data: [], meta } })
    await expect(queryClient.fetchQuery(transactionsQuery({ limit: 5 }))).resolves.toEqual({ data: [], meta })
  })

  it('passes an abort signal so superseded requests can be cancelled', async () => {
    const fetch = mockApi({ '/me': { data: {} } })
    await queryClient.fetchQuery(meQuery)
    expect(fetch.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
  })

  describe('useConvert', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    beforeEach(() => {
      queryClient.setQueryData(['me'], {})
      queryClient.setQueryData(['transactions', { limit: 5 }], { data: [] })
      queryClient.setQueryData(['rate', 'USD', 'NGN'], {})
    })

    it('refetches balances and transactions after a conversion', async () => {
      mockApi({ '/convert': { data: { received: 3058969 } } })
      const { result } = renderHook(() => useConvert(), { wrapper })
      await expect(result.current.mutateAsync({ from: 'USD', to: 'NGN', amount: 1999 })).resolves.toEqual({
        received: 3058969,
      })
      expect(queryClient.getQueryState(['me'])?.isInvalidated).toBe(true)
      expect(queryClient.getQueryState(['transactions', { limit: 5 }])?.isInvalidated).toBe(true)
      expect(queryClient.getQueryState(['rate', 'USD', 'NGN'])?.isInvalidated).toBe(false)
    })

    it('leaves cached data alone when the conversion fails', async () => {
      mockApi({
        '/convert': () =>
          Response.json(
            { error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' } },
            { status: 422 }
          ),
      })
      const { result } = renderHook(() => useConvert(), { wrapper })
      await expect(
        result.current.mutateAsync({ from: 'USD', to: 'NGN', amount: 1999 })
      ).rejects.toMatchObject({
        code: 'INSUFFICIENT_FUNDS',
      })
      expect(queryClient.getQueryState(['me'])?.isInvalidated).toBe(false)
      expect(queryClient.getQueryState(['transactions', { limit: 5 }])?.isInvalidated).toBe(false)
    })
  })
})
