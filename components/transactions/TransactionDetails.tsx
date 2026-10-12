'use client'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Badge, Icon, Money, Skeleton } from '@/components/ui'
import { formatDateTime, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { isCredit, STATUS_TONES } from './meta'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionDetails.module.css'

/** "Transfer out to Kwame Mensah", or just the type when there's no counterparty. */
function headline(tx: Transaction): string {
  const label = TRANSACTION_TYPE_LABELS[tx.type]
  if (!tx.counterparty) return label
  return `${label} ${isCredit(tx.type) ? 'from' : 'to'} ${tx.counterparty}`
}

export function TransactionDetails({ transaction: tx }: { transaction: Transaction }) {
  const credit = isCredit(tx.type)

  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <TransactionAvatar transaction={tx} />
        <p className={styles.headline}>{headline(tx)}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={credit ? styles.creditAmount : styles.amount}
        />
        <Badge tone={STATUS_TONES[tx.status]} dot>
          {TRANSACTION_STATUS_LABELS[tx.status]}
        </Badge>
      </div>

      <section aria-labelledby="details-heading">
        <h3 id="details-heading" className={styles.heading}>
          Details
        </h3>
        <dl className={styles.list}>
          <div className={styles.item}>
            <dt>Reference</dt>
            <dd className={styles.reference}>
              <span className={styles.mono}>{tx.reference}</span>
              <CopyButton text={tx.reference} />
            </dd>
          </div>
          <div className={styles.item}>
            <dt>Date</dt>
            <dd>{formatDateTime(tx.createdAt)}</dd>
          </div>
          <div className={styles.item}>
            <dt>Type</dt>
            <dd>{TRANSACTION_TYPE_LABELS[tx.type]}</dd>
          </div>
          {tx.counterparty && (
            <div className={styles.item}>
              <dt>Counterparty</dt>
              <dd>{tx.counterparty}</dd>
            </div>
          )}
          <div className={styles.item}>
            <dt>Narration</dt>
            {/* Unsanitised upstream text: render as text only. */}
            <dd>{tx.narration}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="summary-heading">
        <h3 id="summary-heading" className={styles.heading}>
          Summary
        </h3>
        <dl className={styles.list}>
          <div className={styles.item}>
            <dt>Amount</dt>
            <dd>
              <Money amount={tx.amount} currency={tx.currency} />
            </dd>
          </div>
          <div className={styles.item}>
            <dt>Fee</dt>
            <dd>
              <Money amount={tx.fee} currency={tx.currency} />
            </dd>
          </div>
          <div className={styles.total}>
            <dt>Total</dt>
            {/* API.md: the fee is charged on top of the amount, in the same currency (minor units). */}
            <dd>
              <Money amount={tx.amount + tx.fee} currency={tx.currency} />
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={copied ? 'Reference copied' : 'Copy reference'}
      title={copied ? 'Copied' : 'Copy reference'}
      onClick={() =>
        navigator.clipboard
          .writeText(text)
          .then(() => setCopied(true))
          .catch(() => {})
      }
    >
      {copied ? <span className={styles.copied}>Copied</span> : <Icon name="copy" size={14} />}
    </button>
  )
}

export function TransactionDetailsSkeleton() {
  return (
    <div className={styles.details}>
      <span className="visually-hidden">Loading transaction…</span>
      <div className={styles.hero}>
        <Skeleton className={styles.skCircle} />
        <Skeleton className={styles.skHeadline} />
        <Skeleton className={styles.skAmount} />
        <Skeleton className={styles.skBadge} />
      </div>
      <div className={styles.list}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.item}>
            <Skeleton className={styles.skLabel} />
            <Skeleton className={styles.skValue} />
          </div>
        ))}
      </div>
    </div>
  )
}
