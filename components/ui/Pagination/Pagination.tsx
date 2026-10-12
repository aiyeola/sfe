import Link from 'next/link'
import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from '../Icon'
import styles from './Pagination.module.css'

type PageItem = number | 'gap'

/**
 * Page numbers to show: a window of three around the current page, plus the first and last pages,
 * with gaps where pages are skipped. A gap never hides a single page. 1 of 12 -> 1 2 3 … 12.
 */
export function pageItems(current: number, total: number): PageItem[] {
  let start = Math.max(1, current - 1)
  let end = Math.min(total, current + 1)
  if (start === 1) end = Math.min(total, 3)
  if (end === total) start = Math.max(1, total - 2)

  const items: PageItem[] = []
  if (start > 1) items.push(1)
  if (start > 3) items.push('gap')
  else if (start === 3) items.push(2)
  for (let page = start; page <= end; page++) items.push(page)
  if (end < total - 2) items.push('gap')
  else if (end === total - 2) items.push(total - 1)
  if (end < total) items.push(total)
  return items
}

export interface PaginationProps {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
  className?: string
}

export function Pagination({ page, totalPages, hrefFor, className }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={cx(styles.pagination, className)}>
      <Step href={page > 1 ? hrefFor(page - 1) : null} label="Previous page">
        <Icon name="chevron-left" size={14} />
        <span className={styles.wide}>Previous</span>
        <span className={styles.narrow}>Prev</span>
      </Step>

      <ol className={styles.pages}>
        {pageItems(page, totalPages).map((item, i) =>
          item === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                className={cx(styles.button, styles.page, item === page && styles.current)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </Link>
            </li>
          )
        )}
      </ol>
      <span className={styles.summary}>
        Page {page} of {totalPages}
      </span>

      <Step href={page < totalPages ? hrefFor(page + 1) : null} label="Next page">
        Next
        <Icon name="chevron-right" size={14} />
      </Step>
    </nav>
  )
}

function Step({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
  if (!href) {
    return (
      <span className={cx(styles.button, styles.disabled)} aria-disabled="true" aria-label={label}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} className={styles.button} aria-label={label}>
      {children}
    </Link>
  )
}
