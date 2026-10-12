import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Currency } from '@/types/api'
import { convert, getMe, getRate, getTransaction, getTransactions, type TransactionQuery } from './endpoints'

// React Query passes an AbortSignal to each queryFn, so superseded or unmounted requests are cancelled.

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: ({ signal }) => getMe({ signal }).then((res) => res.data),
})

/** Resolves to the whole body: list pages need `meta` for pagination. */
export const transactionsQuery = (query: TransactionQuery = {}) =>
  queryOptions({
    queryKey: ['transactions', query],
    queryFn: ({ signal }) => getTransactions(query, { signal }),
  })

export const transactionQuery = (id: string) =>
  queryOptions({
    queryKey: ['transaction', id],
    queryFn: ({ signal }) => getTransaction(id, { signal }).then((res) => res.data),
  })

export const rateQuery = (from: Currency, to: Currency) =>
  queryOptions({
    queryKey: ['rate', from, to],
    queryFn: ({ signal }) => getRate(from, to, { signal }).then((res) => res.data),
  })

/** A conversion moves wallet balances and adds a transaction, so both are refetched after it. */
export function useConvert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof convert>[0]) => convert(body).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meQuery.queryKey })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
