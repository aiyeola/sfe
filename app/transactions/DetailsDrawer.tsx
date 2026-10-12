'use client'
import { useQuery } from '@tanstack/react-query'
import type { Transaction } from '@/types/api'
import { Button, Drawer, EmptyState } from '@/components/ui'
import { TransactionDetails, TransactionDetailsSkeleton } from '@/components/transactions'
import { ApiError } from '@/lib/api/client'
import { getTransaction } from '@/lib/api/endpoints'
import styles from './page.module.css'

export interface DetailsDrawerProps {
  /** `?tx=` from the URL; the drawer is open while it's set. */
  id?: string
  /** The row from the list currently on screen, if it's there: shown instantly, no request. */
  fromList?: Transaction
  onClose: () => void
}

export function DetailsDrawer({ id, fromList, onClose }: DetailsDrawerProps) {
  // Only fetched when opened from a link to a transaction that isn't on the current page.
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['transaction', id],
    queryFn: ({ signal }) => getTransaction(id!, { signal }).then((res) => res.data),
    enabled: Boolean(id) && !fromList,
  })
  const transaction = fromList ?? data

  let content
  if (transaction) {
    content = <TransactionDetails transaction={transaction} />
  } else if (error instanceof ApiError && error.status === 404) {
    content = (
      <EmptyState
        icon="search"
        title="Transaction not found"
        action={
          <Button variant="secondary" onClick={onClose}>
            Back to transactions
          </Button>
        }
        className={styles.drawerState}
      >
        It may have been removed, or the link is wrong.
      </EmptyState>
    )
  } else if (error && !isFetching) {
    content = (
      <EmptyState
        icon="alert"
        tone="danger"
        title="We couldn't load this transaction"
        action={
          <Button iconLeft="refresh" onClick={() => refetch()}>
            Try again
          </Button>
        }
        className={styles.drawerState}
      >
        Check your connection and try again.
      </EmptyState>
    )
  } else {
    content = <TransactionDetailsSkeleton />
  }

  return (
    <Drawer open={Boolean(id)} title="Transaction details" onClose={onClose}>
      {content}
    </Drawer>
  )
}
