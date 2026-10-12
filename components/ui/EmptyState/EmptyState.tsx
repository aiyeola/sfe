import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: IconName
  title: string
  children?: ReactNode
  action?: ReactNode
  /** `danger` for errors; also announces the message to screen readers immediately. */
  tone?: 'primary' | 'danger'
  className?: string
}

export function EmptyState({ icon, title, children, action, tone = 'primary', className }: EmptyStateProps) {
  return (
    <div className={cx(styles.root, className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <span className={cx(styles.icon, styles[tone])}>
        <Icon name={icon} size={20} />
      </span>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
