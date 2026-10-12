import { type ReactNode, Suspense } from 'react'
import { StateSwitcher } from '@/components/demo/StateSwitcher'
import { Navbar } from './Navbar'
import styles from './AppShell.module.css'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className={styles.main}>{children}</main>
      <Suspense>
        <StateSwitcher />
      </Suspense>
    </>
  )
}
