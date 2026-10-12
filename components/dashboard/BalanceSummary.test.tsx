import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BalanceSummary } from './BalanceSummary'

const wallets = [
  { currency: 'NGN', balance: 150050 },
  { currency: 'NGN', balance: 49950 },
] as const

describe('BalanceSummary', () => {
  afterEach(() => localStorage.clear())

  it('totals the wallet balances', () => {
    render(<BalanceSummary wallets={[...wallets]} />)
    expect(screen.getByText('₦2,000.00')).toBeInTheDocument()
  })

  it('hides and shows amounts, and remembers the choice', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<BalanceSummary wallets={[...wallets]} />)
    await user.click(screen.getByRole('button', { name: 'Hide' }))
    expect(screen.getByLabelText('Amount hidden')).toBeInTheDocument()
    expect(screen.queryByText('₦2,000.00')).not.toBeInTheDocument()

    unmount()
    render(<BalanceSummary wallets={[...wallets]} />)
    await user.click(screen.getByRole('button', { name: 'Show' }))
    expect(screen.getByText('₦2,000.00')).toBeInTheDocument()
  })
})
