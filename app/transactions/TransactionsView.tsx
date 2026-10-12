'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Card, EmptyState, Pagination, Select } from '@/components/ui'
import { TransactionList, TransactionListSkeleton } from '@/components/transactions'
import { getTransactions } from '@/lib/api/endpoints'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { DetailsDrawer } from './DetailsDrawer'
import { SearchBox } from './SearchBox'
import { hasFilters, parseFilters, withParams } from './searchParams'
import styles from './page.module.css'

const PATH = '/transactions'
const PAGE_SIZE = 20

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

const count = new Intl.NumberFormat('en-GB')
const plural = (n: number, word: string) => `${count.format(n)} ${word}${n === 1 ? '' : 's'}`

export function TransactionsView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = parseFilters(searchParams)
  const { page, q, type, status, tx } = filters
  const filtered = hasFilters(filters)

  const href = (patch: Parameters<typeof withParams>[1]) => PATH + withParams(searchParams, patch)
  const clearFilters = () => router.push(href({ q: null, type: null, status: null }), { scroll: false })

  const { data, isError, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: ['transactions', { page, q, type, status }],
    // The signal aborts superseded requests: a slow search for "n" can't overwrite results for "netflix".
    queryFn: ({ signal }) => getTransactions({ page, limit: PAGE_SIZE, q, type, status }, { signal }),
    // Keep showing the previous results while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
  const meta = data?.meta
  const transactions = data?.data

  // A shared or stale link can point past the last page: go to the last page instead.
  const lastPage = meta?.totalPages
  const outOfRange = !isPlaceholderData && lastPage !== undefined && page > lastPage
  useEffect(() => {
    if (outOfRange) router.replace(PATH + withParams(searchParams, { page: lastPage }))
  }, [outOfRange, lastPage, router, searchParams])

  // Opening details pushes a history entry, so Back closes them. Closing after an in-app open goes back
  // to that entry; after arriving from a link there is nothing to go back to, so drop ?tx= instead.
  const openedInApp = useRef(false)
  useEffect(() => {
    if (!tx) openedInApp.current = false
  }, [tx])
  const openDetails = (selected: Transaction) => {
    openedInApp.current = true
    router.push(href({ tx: selected.id }), { scroll: false })
  }
  const closeDetails = () => {
    if (openedInApp.current) {
      openedInApp.current = false
      router.back()
    } else {
      router.replace(href({ tx: null }), { scroll: false })
    }
  }

  let content
  if (isError && !isFetching) {
    content = (
      <EmptyState
        icon="alert"
        tone="danger"
        title="We couldn't load your transactions"
        action={
          <Button iconLeft="refresh" onClick={() => refetch()}>
            Try again
          </Button>
        }
      >
        Check your connection and try again.
      </EmptyState>
    )
  } else if (!transactions || !meta || outOfRange) {
    content = <TransactionListSkeleton />
  } else if (transactions.length === 0 && filtered) {
    content = (
      <EmptyState
        icon="search"
        title="No transactions match your filters"
        action={
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      >
        Try a different search term or remove some filters.
      </EmptyState>
    )
  } else if (transactions.length === 0) {
    content = (
      <EmptyState icon="inbox" title="No transactions yet">
        When you add money, send a transfer or pay with your card, it will show up here.
      </EmptyState>
    )
  } else {
    content = <TransactionList transactions={transactions} onSelect={openDetails} />
  }

  const showPagination = Boolean(transactions?.length) && !isError && !outOfRange

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle} aria-live="polite">
          {meta ? plural(meta.total, filtered ? 'result' : 'transaction') : ' '}
        </p>
      </header>

      <div className={styles.filters}>
        <SearchBox
          value={q}
          onCommit={(next) => router.replace(href({ q: next || null }), { scroll: false })}
          className={styles.search}
        />
        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={type ?? ''}
          onChange={(e) => router.push(href({ type: e.target.value || null }), { scroll: false })}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(e) => router.push(href({ status: e.target.value || null }), { scroll: false })}
        />
        {filtered && (
          <Button variant="ghost" className={styles.clear} onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <Card padding="none" className={styles.list} aria-busy={isFetching}>
        <div className={isPlaceholderData || (isFetching && isError) ? styles.stale : undefined}>
          {content}
        </div>
      </Card>

      {showPagination && meta && (
        <div className={styles.footer}>
          <p className={styles.showing}>
            Showing {count.format((meta.page - 1) * meta.limit + 1)}–
            {count.format(Math.min(meta.page * meta.limit, meta.total))} of {count.format(meta.total)}
          </p>
          <Pagination page={page} totalPages={meta.totalPages} hrefFor={(p) => href({ page: p })} />
        </div>
      )}

      <DetailsDrawer id={tx} fromList={transactions?.find((t) => t.id === tx)} onClose={closeDetails} />
    </div>
  )
}
