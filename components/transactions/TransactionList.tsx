import type { Transaction } from '@/types/api'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { dayLabel, localDayKey } from '@/lib/format'
import { TransactionRow } from './TransactionRow'
import styles from './TransactionList.module.css'

interface DayGroup {
  key: string
  label: string
  transactions: Transaction[]
}

/** Groups consecutive (newest-first) transactions by local calendar day. */
function groupByDay(transactions: Transaction[], now: Date): DayGroup[] {
  const groups: DayGroup[] = []
  for (const tx of transactions) {
    const key = localDayKey(tx.createdAt)
    const last = groups.at(-1)
    if (last?.key === key) last.transactions.push(tx)
    else groups.push({ key, label: dayLabel(tx.createdAt, now), transactions: [tx] })
  }
  return groups
}

export interface TransactionListProps {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onSelect }: TransactionListProps) {
  return groupByDay(transactions, new Date()).map((group) => (
    <section key={group.key} aria-labelledby={`day-${group.key}`} className={styles.group}>
      <h2 id={`day-${group.key}`} className={styles.day}>
        {group.label}
      </h2>
      {group.transactions.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} onSelect={onSelect} timeOnly />
      ))}
    </section>
  ))
}

export function TransactionListSkeleton({ rows = 6, heading = true }: { rows?: number; heading?: boolean }) {
  return (
    <div className={styles.skeleton}>
      <span className="visually-hidden">Loading transactions…</span>
      {heading && (
        <div className={styles.day}>
          <Skeleton className={styles.dayBar} />
        </div>
      )}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton className={styles.circle} />
          <span className={styles.lines}>
            <Skeleton className={styles.short} />
            <Skeleton className={styles.long} />
          </span>
          <span className={styles.endLines}>
            <Skeleton className={styles.short} />
            <Skeleton className={styles.tiny} />
          </span>
        </div>
      ))}
    </div>
  )
}

/** Shared with the dashboard, so both lists say the same thing. */
export function TransactionsError({ onRetry, compact }: { onRetry: () => void; compact?: boolean }) {
  return <ErrorState title="We couldn't load your transactions" onRetry={onRetry} compact={compact} />
}

export function NoTransactions({ compact }: { compact?: boolean }) {
  return (
    <EmptyState icon="inbox" title="No transactions yet" compact={compact}>
      When you add money, send a transfer or pay with your card, it will show up here.
    </EmptyState>
  )
}
