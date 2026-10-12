'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Card, CardHeader } from '@/components/ui'
import { TransactionRow } from '@/components/transactions'
import { DetailsDrawer } from '@/app/transactions/DetailsDrawer'
import { transactionsQuery } from '@/lib/api/queries'
import styles from './RecentTransactions.module.css'

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const { data, isPending: isLoading } = useQuery(transactionsQuery({ limit: 5 }))
  const transactions = data?.data

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
      {isLoading && <p className={styles.message}>Loading…</p>}
      {!isLoading && !transactions?.length && <p className={styles.message}>No transactions yet.</p>}
      {transactions?.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} />
      ))}

      <DetailsDrawer id={selected?.id} fromList={selected ?? undefined} onClose={() => setSelected(null)} />
    </Card>
  )
}
