'use client'
import { useQuery } from '@tanstack/react-query'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { meQuery } from '@/lib/api/queries'
import styles from './page.module.css'

export default function DashboardPage() {
  const { data: user, isPending } = useQuery(meQuery)

  if (isPending) return <p className={styles.loading}>Loading…</p>

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
