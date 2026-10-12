'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { cx } from '@/lib/cx'
import styles from './StateSwitcher.module.css'

/** Mock API scenarios (API.md). The mock reads `__scenario` from the page URL via the Referer header. */
const SCENARIOS = [
  { value: null, label: 'Live', hint: 'Real latency, ~3% random failures' },
  { value: 'slow', label: 'Loading', hint: '3s latency on every request' },
  { value: 'error', label: 'Error', hint: 'Every request fails with a 500' },
  { value: 'empty', label: 'Empty', hint: 'List endpoints return nothing' },
] as const

/** States that need more than a scenario. `txn_255s` is the mock's first (deterministic) transaction id. */
const ROUTE_STATES: Record<string, { label: string; href: string }[]> = {
  '/transactions': [
    { label: 'No search results', href: '/transactions?q=zzzz' },
    { label: 'Details loading (from a link)', href: '/transactions?tx=txn_255s&__scenario=slow' },
    { label: 'Details', href: '/transactions?tx=txn_255s' },
    { label: 'Details not found', href: '/transactions?tx=txn_missing' },
    { label: 'Page out of range', href: '/transactions?page=999' },
  ],
}

function withScenario(pathname: string, params: URLSearchParams, scenario: string | null): string {
  const next = new URLSearchParams(params)
  if (scenario) next.set('__scenario', scenario)
  else next.delete('__scenario')
  const qs = next.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

/**
 * Floating panel for demoing loading, error and empty states on any route. Links are plain <a>s on
 * purpose: a full page load drops cached query data, so every request re-runs under the new scenario.
 */
export function StateSwitcher() {
  const pathname = usePathname()
  const params = new URLSearchParams(useSearchParams().toString())
  const current = params.get('__scenario')
  const active = SCENARIOS.find((s) => s.value === current) ?? SCENARIOS[0]
  const routeStates = ROUTE_STATES[pathname]

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>
        <span className={cx(styles.dot, active.value && styles.forced)} aria-hidden />
        States{active.value && `: ${active.label}`}
      </summary>
      <div className={styles.body}>
        <p className={styles.heading}>API scenario</p>
        <ul className={styles.list}>
          {SCENARIOS.map((s) => (
            <li key={s.label}>
              <a
                href={withScenario(pathname, params, s.value)}
                className={styles.option}
                aria-current={s === active ? 'true' : undefined}
              >
                <span className={styles.label}>{s.label}</span>
                <span className={styles.hint}>{s.hint}</span>
              </a>
            </li>
          ))}
        </ul>

        {routeStates && (
          <>
            <p className={styles.heading}>This page</p>
            <ul className={styles.list}>
              {routeStates.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className={styles.option}>
                    <span className={styles.label}>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className={styles.note}>
          To turn random failures off, set <code>MOCK_FAILURE_RATE=0</code> in <code>.env.local</code>.
        </p>
      </div>
    </details>
  )
}
