import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Wallet } from '@/types/api'
import { mockApi, renderWithProviders } from '@/test-utils'
import { BalanceSummary } from './BalanceSummary'

const wallets: Wallet[] = [
  { currency: 'NGN', balance: 150050 },
  { currency: 'NGN', balance: 49950 },
]

const rate = (url: URL) => ({
  data: {
    from: url.searchParams.get('from'),
    to: 'NGN',
    rate: url.searchParams.get('from') === 'USD' ? 1500 : 100,
    updatedAt: '2026-10-08T12:00:00.000Z',
  },
})

describe('BalanceSummary', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('totals naira wallets without fetching rates', () => {
    const fetch = mockApi({})
    renderWithProviders(<BalanceSummary wallets={wallets} />)
    expect(screen.getByText('₦2,000.00')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('converts foreign wallets to naira before totalling', async () => {
    mockApi({ '/rates': rate })
    renderWithProviders(
      <BalanceSummary
        wallets={[
          { currency: 'NGN', balance: 150050 },
          { currency: 'USD', balance: 4599 },
          { currency: 'GHS', balance: 1000 },
        ]}
      />
    )
    // ₦1,500.50 + $45.99 × 1500 + GH₵10.00 × 100
    expect(await screen.findByText('₦71,485.50')).toBeInTheDocument()
  })

  it('says the total is unavailable when a rate fails', async () => {
    mockApi({ '/rates': Response.json({ error: { code: 'INTERNAL', message: 'Boom' } }, { status: 500 }) })
    renderWithProviders(<BalanceSummary wallets={[{ currency: 'USD', balance: 4599 }]} />)
    expect(await screen.findByText('Unavailable')).toBeInTheDocument()
  })

  it('hides and shows amounts, and remembers the choice', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<BalanceSummary wallets={wallets} />)
    await user.click(screen.getByRole('button', { name: 'Hide' }))
    expect(screen.getByLabelText('Amount hidden')).toBeInTheDocument()
    expect(screen.queryByText('₦2,000.00')).not.toBeInTheDocument()

    unmount()
    renderWithProviders(<BalanceSummary wallets={wallets} />)
    await user.click(screen.getByRole('button', { name: 'Show' }))
    expect(screen.getByText('₦2,000.00')).toBeInTheDocument()
  })
})
