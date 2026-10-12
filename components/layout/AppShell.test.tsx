import { screen } from '@testing-library/react'
import { mockApi, renderWithProviders } from '@/test-utils'
import { AppShell } from './AppShell'

vi.mock('next/navigation', () => ({ usePathname: () => '/', useSearchParams: () => new URLSearchParams() }))

afterEach(() => vi.restoreAllMocks())

describe('AppShell', () => {
  it('wraps the page in the navbar and main landmark', () => {
    mockApi({})
    renderWithProviders(
      <AppShell>
        <h1>Dashboard</h1>
      </AppShell>
    )
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Dashboard' }))
  })
})
