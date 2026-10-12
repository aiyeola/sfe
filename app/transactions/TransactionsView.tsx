'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useQueryStates, type Nullable } from 'nuqs'
import { useEffect, useRef } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Card, EmptyState, Pagination, Select } from '@/components/ui'
import {
  NoTransactions,
  TransactionList,
  TransactionListSkeleton,
  TransactionsError,
} from '@/components/transactions'
import { transactionsQuery } from '@/lib/api/queries'
import { cx } from '@/lib/cx'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { DetailsDrawer } from './DetailsDrawer'
import { SearchBox } from './SearchBox'
import { filterParsers, serializeFilters } from './searchParams'
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
  const searchParams = useSearchParams()
  // nuqs updates are shallow (History API, no server round trip): this page's data is fetched client-side.
  const [params, setParams] = useQueryStates(filterParsers)
  const { page } = params
  const q = params.q.trim()
  const type = params.type ?? undefined
  const status = params.status ?? undefined
  const tx = params.tx || undefined
  const filtered = Boolean(q || type || status)

  // Changing a filter goes back to page 1.
  type FilterPatch = Partial<Nullable<Pick<typeof params, 'q' | 'type' | 'status'>>>
  const setFilters = (patch: FilterPatch, history: 'push' | 'replace' = 'push') =>
    setParams({ ...patch, page: null }, { history })
  const clearFilters = () => setFilters({ q: null, type: null, status: null })

  const { data, isError, isFetching, isPlaceholderData, refetch } = useQuery({
    // The query key is per filter set: a slow search for "n" can't overwrite results for "netflix".
    ...transactionsQuery({ page, limit: PAGE_SIZE, q, type, status }),
    // Keep showing the previous results while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
  const meta = data?.meta
  const transactions = data?.data

  // A shared or stale link can point past the last page: go to the last page instead.
  const lastPage = meta && Math.max(1, meta.totalPages) // an empty result may report 0 pages
  const outOfRange = !isPlaceholderData && lastPage !== undefined && page > lastPage
  useEffect(() => {
    if (outOfRange) setParams({ page: lastPage })
  }, [outOfRange, lastPage, setParams])

  // Opening details pushes a history entry, so Back closes them. Closing after an in-app open goes back
  // to that entry; after arriving from a link there is nothing to go back to, so drop ?tx= instead.
  const openedInApp = useRef(false)
  useEffect(() => {
    if (!tx) openedInApp.current = false
  }, [tx])
  const openDetails = (selected: Transaction) => {
    openedInApp.current = true
    setParams({ tx: selected.id }, { history: 'push' })
  }
  const closeDetails = () => {
    if (openedInApp.current) {
      openedInApp.current = false
      history.back()
    } else {
      setParams({ tx: null })
    }
  }

  let content
  if (isError && !isFetching) {
    content = <TransactionsError onRetry={() => refetch()} />
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
    content = <NoTransactions />
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
          onCommit={(next) => setFilters({ q: next || null }, 'replace')}
          className={styles.search}
        />
        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={type ?? ''}
          onChange={(e) => setFilters({ type: filterParsers.type.parse(e.target.value) })}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(e) => setFilters({ status: filterParsers.status.parse(e.target.value) })}
        />
        {/* Always rendered so its grid track doesn't pop in and shift the row. */}
        <Button
          variant="ghost"
          className={cx(styles.clear, !filtered && styles.hidden)}
          onClick={clearFilters}
        >
          Clear filters
        </Button>
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
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            hrefFor={(p) => PATH + serializeFilters(searchParams, { page: p })}
          />
        </div>
      )}

      <DetailsDrawer id={tx} fromList={transactions?.find((t) => t.id === tx)} onClose={closeDetails} />
    </div>
  )
}
