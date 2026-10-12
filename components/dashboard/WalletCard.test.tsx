import { render, screen } from '@testing-library/react'
import { WalletCard } from './WalletCard'

describe('WalletCard', () => {
  it('shows the wallet currency and balance', () => {
    render(<WalletCard wallet={{ currency: 'GHS', balance: 85020 }} />)
    expect(screen.getByText('GHS wallet')).toBeInTheDocument()
    expect(screen.getByText('GH₵850.20')).toBeInTheDocument()
  })
})
