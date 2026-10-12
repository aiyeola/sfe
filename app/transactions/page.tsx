import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionListSkeleton } from '@/components/transactions'
import { TransactionsView } from './TransactionsView'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  // useSearchParams (and nuqs, which reads it) needs a Suspense boundary.
  return (
    <Suspense fallback={<TransactionListSkeleton />}>
      <TransactionsView />
    </Suspense>
  )
}
