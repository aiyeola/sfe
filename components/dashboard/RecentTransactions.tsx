'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Card, CardHeader } from '@/components/ui'
import {
  NoTransactions,
  TransactionListSkeleton,
  TransactionRow,
  TransactionsError,
} from '@/components/transactions'
import { DetailsDrawer } from '@/app/transactions/DetailsDrawer'
import { transactionsQuery } from '@/lib/api/queries'
import styles from './RecentTransactions.module.css'

const LIMIT = 5

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const { data, isError, isFetching, refetch } = useQuery(transactionsQuery({ limit: LIMIT }))
  const transactions = data?.data

  let content
  if (isError && !isFetching) content = <TransactionsError onRetry={() => refetch()} compact />
  else if (!transactions) content = <TransactionListSkeleton rows={LIMIT} heading={false} />
  else if (transactions.length === 0) content = <NoTransactions compact />
  else
    content = transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} />)

  return (
    <Card padding="none">
      <div className={styles.header}>
        <CardHeader
          title="Recent transactions"
          action={
            <Link href="/transactions" className={styles.seeAll}>
              See all
            </Link>
          }
        />
      </div>
      <div aria-busy={isFetching}>{content}</div>

      <DetailsDrawer id={selected?.id} fromList={selected ?? undefined} onClose={() => setSelected(null)} />
    </Card>
  )
}
