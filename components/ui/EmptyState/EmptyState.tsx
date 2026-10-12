import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Button } from '../Button'
import { Icon, type IconName } from '../Icon'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: IconName
  title: string
  children?: ReactNode
  action?: ReactNode
  /** `danger` for errors; also announces the message to screen readers immediately. */
  tone?: 'primary' | 'danger'
  /** Less padding, for small cards. */
  compact?: boolean
  className?: string
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  tone = 'primary',
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx(styles.root, compact && styles.compact, className)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <span className={cx(styles.icon, styles[tone])}>
        <Icon name={icon} size={20} />
      </span>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

export interface ErrorStateProps {
  title: string
  onRetry: () => void
  compact?: boolean
  className?: string
}

/** A failed load, with a retry. */
export function ErrorState({ title, onRetry, compact, className }: ErrorStateProps) {
  return (
    <EmptyState
      icon="alert"
      tone="danger"
      title={title}
      compact={compact}
      className={className}
      action={
        <Button iconLeft="refresh" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      Check your connection and try again.
    </EmptyState>
  )
}
