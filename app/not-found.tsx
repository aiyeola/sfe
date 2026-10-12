import Link from 'next/link'
import styles from './not-found.module.css'

// Next's built-in 404 uses inline style attributes, which the CSP (proxy.ts) blocks.
export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.text}>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className={styles.link}>
        Back to dashboard
      </Link>
    </div>
  )
}
