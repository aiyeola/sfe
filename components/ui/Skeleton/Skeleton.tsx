import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

/** Placeholder block. Size it with `className` (no inline styles: the CSP blocks them). */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cx(styles.skeleton, className)} aria-hidden />
}
