import { type ReactNode, Suspense } from 'react'
import { StateSwitcher } from '@/components/demo/StateSwitcher'
import { Navbar } from './Navbar'
import styles from './AppShell.module.css'

// Demo tooling: always on in development, opt-in for production builds (e.g. a review deploy).
const showStateSwitcher =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEMO_STATES === 'true'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className={styles.main}>{children}</main>
      {showStateSwitcher && (
        <Suspense>
          <StateSwitcher />
        </Suspense>
      )}
    </>
  )
}
