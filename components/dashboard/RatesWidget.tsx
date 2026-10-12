'use client'
import { useQueries } from '@tanstack/react-query'
import type { Currency } from '@/types/api'
import { Card, CardHeader, ErrorState, Skeleton } from '@/components/ui'
import { rateQuery } from '@/lib/api/queries'
import { formatTime } from '@/lib/format'
import styles from './RatesWidget.module.css'

const QUOTES: Currency[] = ['USD', 'GHS']

export function RatesWidget({ base }: { base: Currency }) {
  const results = useQueries({ queries: QUOTES.map((quote) => rateQuery(quote, base)) })
  const failed = results.some((r) => r.isError) && !results.some((r) => r.isFetching)
  const updatedAt = results[0].data?.updatedAt

  return (
    <Card>
      <CardHeader title="Today's rates" />
      {failed ? (
        <ErrorState
          title="We couldn't load rates"
          onRetry={() => results.forEach((r) => r.isError && r.refetch())}
          compact
        />
      ) : (
        <>
          <dl className={styles.list} aria-busy={results.some((r) => r.isFetching)}>
            {QUOTES.map((quote, i) => {
              const rate = results[i].data
              return (
                <div key={quote} className={styles.row}>
                  <dt>1 {quote}</dt>
                  <dd className={styles.value}>
                    {rate ? `${rate.rate} ${base}` : <Skeleton className={styles.skValue} />}
                  </dd>
                </div>
              )
            })}
          </dl>
          {updatedAt ? (
            <p className={styles.updated}>Updated {formatTime(updatedAt)}</p>
          ) : (
            <Skeleton className={styles.skUpdated} />
          )}
        </>
      )}
    </Card>
  )
}
