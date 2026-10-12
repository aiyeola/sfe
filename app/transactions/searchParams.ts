import type { TransactionStatus, TransactionType } from '@/types/api'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

/** Page state that lives in the URL, so refresh, shared links and Back restore it. */
export interface Filters {
  page: number
  q: string
  type?: TransactionType
  status?: TransactionStatus
  /** Open transaction details. */
  tx?: string
}

type Params = Pick<URLSearchParams, 'get' | 'toString'>
type Patch = Partial<Record<'page' | 'q' | 'type' | 'status' | 'tx', string | number | null>>

const FILTER_KEYS = ['q', 'type', 'status'] as const

const isKeyOf = <K extends string>(map: Record<K, string>, value: string | null): value is K =>
  value !== null && Object.hasOwn(map, value)

/** The URL is user input: anything unrecognised falls back to the default. */
export function parseFilters(params: Params): Filters {
  const page = Number(params.get('page'))
  const type = params.get('type')
  const status = params.get('status')
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    q: params.get('q')?.trim() ?? '',
    type: isKeyOf(TRANSACTION_TYPE_LABELS, type) ? type : undefined,
    status: isKeyOf(TRANSACTION_STATUS_LABELS, status) ? status : undefined,
    tx: params.get('tx') || undefined,
  }
}

export const hasFilters = (filters: Filters) => Boolean(filters.q || filters.type || filters.status)

/**
 * Query string for the current params with `patch` applied (null/'' removes a key). Params this page
 * doesn't own, such as `__scenario`, are kept. Changing a filter goes back to page 1.
 */
export function withParams(params: Params, patch: Patch): string {
  const next = new URLSearchParams(params.toString())
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === '' || value === undefined) next.delete(key)
    else next.set(key, String(value))
  }
  if (FILTER_KEYS.some((key) => key in patch)) next.delete('page')
  if (next.get('page') === '1') next.delete('page')
  const qs = next.toString()
  return qs ? `?${qs}` : ''
}
