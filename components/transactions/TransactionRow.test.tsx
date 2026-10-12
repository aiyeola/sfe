import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { initials } from './meta'
import { TransactionRow } from './TransactionRow'

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'bill_payment',
  status: 'failed',
  currency: 'NGN',
  amount: 1850000,
  fee: 0,
  narration: 'Bill payment - Spectranet <img src="x" onerror="alert(1)">',
  counterparty: null,
  createdAt: '2026-10-12T08:41:00.000Z',
}

describe('TransactionRow', () => {
  it('renders unsanitised narration as text, never as markup', () => {
    const { container } = render(<TransactionRow transaction={tx} />)
    expect(screen.getByText(tx.narration)).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('signs debits and shows the status', () => {
    render(<TransactionRow transaction={tx} />)
    expect(screen.getByText('-₦18,500.00')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toHaveClass('danger')
  })
})

describe('initials', () => {
  it('takes the first letter of the first two words, splitting on hyphens', () => {
    expect(initials('Kwame Mensah')).toBe('KM')
    expect(initials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(initials('ada')).toBe('A')
  })
})
