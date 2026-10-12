import type { Transaction } from '@/types/api'
import { Badge, Money } from '@/components/ui'
import { formatDateTime, formatTime, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { isCredit, STATUS_TONES } from './meta'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transaction: Transaction
  onSelect?: (transaction: Transaction) => void
  /** Show only the time, for rows already grouped under a date heading. */
  timeOnly?: boolean
}

export function TransactionRow({ transaction: tx, onSelect, timeOnly = false }: TransactionRowProps) {
  const credit = isCredit(tx.type)

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
      <TransactionAvatar transaction={tx} />
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        {/* Narration comes unsanitised from upstream providers: always render it as text. */}
        <span className={styles.narration} title={tx.narration}>
          {tx.narration}
        </span>
      </span>
      <Badge tone={STATUS_TONES[tx.status]} dot className={styles.status}>
        {TRANSACTION_STATUS_LABELS[tx.status]}
      </Badge>
      <span className={styles.end}>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={credit ? styles.credit : styles.amount}
        />
        <span className={styles.meta}>
          {timeOnly ? formatTime(tx.createdAt) : formatDateTime(tx.createdAt)}
        </span>
      </span>
    </button>
  )
}
