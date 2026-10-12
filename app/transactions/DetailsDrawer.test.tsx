import { fireEvent, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { mockApi, renderWithProviders } from '@/test-utils'
import { DetailsDrawer } from './DetailsDrawer'

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 4599,
  fee: 0,
  narration: 'Card payment - Netflix',
  counterparty: null,
  createdAt: '2026-09-30T14:22:00.000Z',
}

const notFound = () =>
  Response.json({ error: { code: 'NOT_FOUND', message: 'Transaction txn_1 not found' } }, { status: 404 })
const serverError = () => Response.json({ error: { code: 'INTERNAL', message: 'Boom' } }, { status: 500 })

describe('DetailsDrawer', () => {
  afterEach(() => vi.restoreAllMocks())

  it('stays closed without an id', () => {
    const fetch = mockApi({})
    renderWithProviders(<DetailsDrawer onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the row from the list instantly, without a request', () => {
    const fetch = mockApi({})
    renderWithProviders(<DetailsDrawer id="txn_1" fromList={tx} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
    expect(screen.getByText('Card payment - Netflix')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('loads a transaction that is not on the current page', async () => {
    mockApi({ '/transactions/txn_1': { data: tx } })
    renderWithProviders(<DetailsDrawer id="txn_1" onClose={vi.fn()} />)
    expect(screen.getByText('Loading transaction…')).toBeInTheDocument()
    expect(await screen.findByText('Card payment - Netflix')).toBeInTheDocument()
  })

  it('says when the transaction does not exist, and offers a way back', async () => {
    mockApi({ '/transactions/': notFound })
    const onClose = vi.fn()
    renderWithProviders(<DetailsDrawer id="txn_1" onClose={onClose} />)
    expect(await screen.findByText('Transaction not found')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back to transactions' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('offers a retry when loading fails', async () => {
    const fetch = mockApi({ '/transactions/': serverError })
    renderWithProviders(<DetailsDrawer id="txn_1" onClose={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load this transaction")
    fetch.mockResolvedValue(Response.json({ data: tx }))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Card payment - Netflix')).toBeInTheDocument()
  })

  it('closes from its close button', () => {
    const onClose = vi.fn()
    renderWithProviders(<DetailsDrawer id="txn_1" fromList={tx} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
