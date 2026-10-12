'use client'
import { useSyncExternalStore } from 'react'
import type { Currency } from '@/types/api'
import { cx } from '@/lib/cx'
import { formatMoney } from '@/lib/format'
import styles from './Money.module.css'

// App-wide "hide amounts" toggle, persisted in localStorage; every <Money> is masked while hidden.
const STORAGE_KEY = 'amounts-hidden'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener) // other tabs
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function getHidden() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function setHidden(hidden: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, hidden ? '1' : '0')
  } catch {}
  listeners.forEach((listener) => listener())
}

export function useAmountsHidden() {
  const hidden = useSyncExternalStore(subscribe, getHidden, () => false)
  return { hidden, setHidden }
}

export interface MoneyProps {
  /** Minor units. */
  amount: number
  currency: Currency
  /** Prefix with + or -. */
  sign?: 'credit' | 'debit'
  className?: string
}

export function Money({ amount, currency, sign, className }: MoneyProps) {
  const { hidden } = useAmountsHidden()
  if (hidden) {
    return (
      <span className={cx(styles.money, className)} aria-label="Amount hidden">
        ••••••
      </span>
    )
  }
  const text = sign
    ? formatMoney(sign === 'debit' ? -amount : amount, currency, { signDisplay: 'always' })
    : formatMoney(amount, currency)
  return <span className={cx(styles.money, className)}>{text}</span>
}
