'use client'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Icon } from '../Icon'
import styles from './Drawer.module.css'

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/**
 * Modal side panel (bottom sheet on small screens) built on <dialog>, so focus trapping, Escape,
 * an inert background and focus restoration come from the browser.
 */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  // The last content shown while open, so the panel still has it while it animates out.
  const [shown, setShown] = useState<{ children: ReactNode; footer?: ReactNode }>()
  if (open && (shown?.children !== children || shown?.footer !== footer)) setShown({ children, footer })

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      // Fires for Escape as well as our own close(); only report closes the parent didn't ask for.
      onClose={() => open && onClose()}
      // The panel fills the dialog, so a click whose target is the dialog itself hit the backdrop.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {shown && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className={styles.body}>{shown.children}</div>
          {shown.footer && <div className={styles.footer}>{shown.footer}</div>}
        </div>
      )}
    </dialog>
  )
}
