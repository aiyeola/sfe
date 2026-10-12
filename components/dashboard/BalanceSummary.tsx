'use client'
import { useQueries } from '@tanstack/react-query'
import type { Wallet } from '@/types/api'
import { Button, Card, Money, Skeleton, useAmountsHidden } from '@/components/ui'
import { rateQuery } from '@/lib/api/queries'
import styles from './BalanceSummary.module.css'

const BASE = 'NGN'

export function BalanceSummary({ wallets }: { wallets: Wallet[] }) {
  const { hidden, setHidden } = useAmountsHidden()
  // Balances are in different currencies, so foreign wallets are converted to NGN before summing.
  // Every currency has 100 minor units, so a per-unit rate converts minor units directly.
  const foreign = wallets.filter((wallet) => wallet.currency !== BASE)
  const rates = useQueries({ queries: foreign.map((wallet) => rateQuery(wallet.currency, BASE)) })
  const total = rates.every((r) => r.data)
    ? wallets.reduce((sum, wallet) => {
        const rate = wallet.currency === BASE ? 1 : rates[foreign.indexOf(wallet)].data!.rate
        return sum + Math.round(wallet.balance * rate)
      }, 0)
    : undefined
  const failed = rates.some((r) => r.isError) && !rates.some((r) => r.isFetching)

  return (
    <Card className={styles.card}>
      <div>
        <p className={styles.label}>Total balance</p>
        <p className={styles.total} aria-busy={total === undefined && !failed}>
          {total !== undefined ? (
            <Money amount={total} currency={BASE} />
          ) : failed ? (
            <span className={styles.unavailable}>Unavailable</span>
          ) : (
            <Skeleton className={styles.skTotal} />
          )}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        iconLeft={hidden ? 'eye' : 'eye-off'}
        onClick={() => setHidden(!hidden)}
      >
        {hidden ? 'Show' : 'Hide'}
      </Button>
    </Card>
  )
}
