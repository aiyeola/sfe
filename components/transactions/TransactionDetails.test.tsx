import { act, fireEvent, render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionDetails } from './TransactionDetails'

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  status: 'pending',
  currency: 'NGN',
  amount: 1850000,
  fee: 5000,
  narration: 'Rent <img src="x" onerror="alert(1)">',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-12T08:41:00.000Z',
}

const stubClipboard = (writeText: () => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

const detail = (term: string) => screen.getByText(term, { selector: 'dt' }).nextElementSibling

describe('TransactionDetails', () => {
  afterEach(() => {
    vi.useRealTimers()
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('describes a debit to a counterparty, with the fee added to the total', () => {
    const { container } = render(<TransactionDetails transaction={tx} />)
    expect(screen.getByText('Transfer out to Kwame Mensah')).toBeInTheDocument()
    expect(screen.getByText('-₦18,500.00')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toHaveClass('warning')
    expect(detail('Counterparty')).toHaveTextContent('Kwame Mensah')
    expect(detail('Narration')).toHaveTextContent(tx.narration)
    expect(container.querySelector('img')).toBeNull()
    expect(detail('Amount')).toHaveTextContent('₦18,500.00')
    expect(detail('Fee')).toHaveTextContent('₦50.00')
    expect(detail('Total')).toHaveTextContent('₦18,550.00')
  })

  it('describes a credit from a counterparty', () => {
    render(<TransactionDetails transaction={{ ...tx, type: 'transfer_in' }} />)
    expect(screen.getByText('Transfer in from Kwame Mensah')).toBeInTheDocument()
    expect(screen.getByText('+₦18,500.00')).toBeInTheDocument()
  })

  it('uses just the type, and no counterparty row, when there is no counterparty', () => {
    render(<TransactionDetails transaction={{ ...tx, type: 'bill_payment', counterparty: null }} />)
    expect(screen.getAllByText('Bill payment')).toHaveLength(2)
    expect(screen.queryByText('Counterparty')).toBeNull()
  })

  it('copies the reference and confirms briefly', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)
    vi.useFakeTimers()
    render(<TransactionDetails transaction={tx} />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy reference' })))
    expect(writeText).toHaveBeenCalledWith('ACM-48213377')
    expect(screen.getByRole('button', { name: 'Reference copied' })).toHaveTextContent('Copied')
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole('button', { name: 'Copy reference' })).toBeInTheDocument()
  })

  it('stays quiet when the clipboard is unavailable', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    stubClipboard(writeText)
    render(<TransactionDetails transaction={tx} />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy reference' })))
    expect(screen.getByRole('button', { name: 'Copy reference' })).toBeInTheDocument()
  })
})
