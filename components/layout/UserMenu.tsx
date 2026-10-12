'use client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@/types/api'
import { Avatar, Icon } from '@/components/ui'
import { meQuery } from '@/lib/api/queries'
import styles from './UserMenu.module.css'

const TIER_LABELS: Record<User['tier'], string> = {
  basic: 'Basic',
  verified: 'Verified',
  premium: 'Premium',
}

export function UserMenu() {
  const [open, setOpen] = useState(false)
  // Non-critical: if /me fails the menu shows a blank avatar.
  const { data: user } = useQuery(meQuery)
  const ref = useRef<HTMLDivElement>(null)

  // Close on Escape or a click outside, like a native menu.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div ref={ref} className={styles.menu}>
      <button type="button" className={styles.trigger} onClick={() => setOpen(!open)} aria-expanded={open}>
        <Avatar src={user?.avatarUrl ?? null} alt="" size="sm" />
        <span className={styles.name}>{user?.firstName}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.fullName}>
            {user?.firstName} {user?.lastName}
          </div>
          <div className={styles.email}>{user?.email}</div>
          {user && <div className={styles.tier}>{TIER_LABELS[user.tier]} account</div>}
        </div>
      )}
    </div>
  )
}
