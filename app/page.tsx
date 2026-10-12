'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, ErrorState, Skeleton } from '@/components/ui'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { meQuery } from '@/lib/api/queries'
import styles from './page.module.css'

export default function DashboardPage() {
  const { data: user, isError, isFetching, refetch } = useQuery(meQuery)

  // Like the Transactions page: the header and layout stay put; only the data areas change state.
  let account
  if (user) {
    account = (
      <>
        <BalanceSummary wallets={user.wallets} />
        <div className={styles.wallets}>
          {user.wallets.map((wallet) => (
            <WalletCard key={wallet.currency} wallet={wallet} />
          ))}
        </div>
      </>
    )
  } else if (isError && !isFetching) {
    account = (
      <Card padding="none">
        <ErrorState title="We couldn't load your account" onRetry={() => refetch()} />
      </Card>
    )
  } else {
    account = <AccountSkeleton />
  }

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Welcome back{user && `, ${user.firstName}`}</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      {account}

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}

function AccountSkeleton() {
  return (
    <>
      <span className="visually-hidden">Loading your account…</span>
      <Card>
        <Skeleton className={styles.skLabel} />
        <Skeleton className={styles.skTotal} />
      </Card>
      <div className={styles.wallets}>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className={styles.skWallet} />
        ))}
      </div>
    </>
  )
}
