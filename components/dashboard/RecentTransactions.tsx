'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Card, CardHeader, Drawer, Money } from '@/components/ui'
import { TransactionRow } from '@/components/transactions'
import { getTransactions } from '@/lib/api/endpoints'
import { ignoreAbort } from '@/lib/api/client'
import { formatDateTime, TRANSACTION_STATUS_LABELS } from '@/lib/format'
import styles from './RecentTransactions.module.css'

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    getTransactions({ limit: 5 }, { signal: controller.signal })
      .then((res) => setTransactions(res.data))
      .catch(ignoreAbort)
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

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

      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && (
          <dl className={styles.details}>
            <dt>Reference</dt>
            <dd>{selected.reference}</dd>
            <dt>Amount</dt>
            <dd>
              <Money amount={selected.amount} currency={selected.currency} />
            </dd>
            <dt>Status</dt>
            <dd>{TRANSACTION_STATUS_LABELS[selected.status]}</dd>
            <dt>Date</dt>
            <dd>{formatDateTime(selected.createdAt)}</dd>
          </dl>
        )}
      </Drawer>
    </Card>
  )
}
