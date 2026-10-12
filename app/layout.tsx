import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Acme Wallet', template: '%s · Acme Wallet' },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The CSP nonce (proxy.ts) is per request, so pages must render per request, not at build time.
  await connection()

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
