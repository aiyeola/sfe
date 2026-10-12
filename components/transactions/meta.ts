import type { TransactionStatus, TransactionType } from '@/types/api'
import type { BadgeTone, IconName } from '@/components/ui'

export const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

export const STATUS_TONES: Record<TransactionStatus, BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}

const CREDIT_TYPES: ReadonlySet<TransactionType> = new Set(['deposit', 'transfer_in', 'conversion'])

/** Money coming into the wallet. A conversion's amount is what landed in its (target) currency. */
export const isCredit = (type: TransactionType) => CREDIT_TYPES.has(type)

/** "Okonkwo-Adeyemi Logistics" -> "OA" */
export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
