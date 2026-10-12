'use client'
import { useEffect, useState } from 'react'
import type { User } from '@/types/api'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { getMe } from '@/lib/api/endpoints'
import { ignoreAbort } from '@/lib/api/client'
import styles from './page.module.css'

export default function DashboardPage() {
  const [user, setUser] = useState<User>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    getMe({ signal: controller.signal })
      .then((res) => setUser(res.data))
      .catch(ignoreAbort)
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  if (isLoading) return <p className={styles.loading}>Loading…</p>

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Welcome back, {user!.firstName}</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      <BalanceSummary wallets={user!.wallets} />

      <div className={styles.wallets}>
        {user!.wallets.map((wallet) => (
          <WalletCard key={wallet.currency} wallet={wallet} />
        ))}
      </div>

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
