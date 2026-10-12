import type { Transaction } from '@/types/api'
import { Icon } from '@/components/ui'
import { initials, TYPE_ICONS } from './meta'
import styles from './TransactionAvatar.module.css'

/** Counterparty initials for transfers, otherwise the transaction type's icon. */
export function TransactionAvatar({ transaction: tx }: { transaction: Transaction }) {
  return (
    <span className={styles.avatar} aria-hidden>
      {tx.counterparty ? initials(tx.counterparty) : <Icon name={TYPE_ICONS[tx.type]} size={18} />}
    </span>
  )
}
