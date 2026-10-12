import { createParser, createSerializer, parseAsString, parseAsStringLiteral } from 'nuqs'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

const keys = <K extends string>(map: Record<K, string>) => Object.keys(map) as K[]

/**
 * Page state that lives in the URL, so refresh, shared links and Back restore it.
 * The URL is user input: anything unrecognised falls back to the default.
 */
export const filterParsers = {
  page: createParser({
    parse: (v) => (Number.isInteger(Number(v)) && Number(v) >= 1 ? Number(v) : null),
    serialize: String,
  }).withDefault(1),
  q: parseAsString.withDefault(''),
  type: parseAsStringLiteral(keys<TransactionType>(TRANSACTION_TYPE_LABELS)),
  status: parseAsStringLiteral(keys<TransactionStatus>(TRANSACTION_STATUS_LABELS)),
  /** Open transaction details. */
  tx: parseAsString,
}

/** Keeps params this page doesn't own, such as `__scenario`, and drops defaults (page 1). */
export const serializeFilters = createSerializer(filterParsers)
