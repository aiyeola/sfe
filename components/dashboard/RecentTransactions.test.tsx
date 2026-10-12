import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Transaction } from '@/types/api'
import { mockApi, renderWithProviders } from '@/test-utils'
import { RecentTransactions } from './RecentTransactions'

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'transfer_in',
  status: 'successful',
  currency: 'NGN',
  amount: 2500000,
  fee: 0,
  narration: 'Rent share',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-12T08:41:00.000Z',
}
const meta = { page: 1, limit: 5, total: 1, totalPages: 1 }
const serverError = () => Response.json({ error: { code: 'INTERNAL', message: 'Boom' } }, { status: 500 })

describe('RecentTransactions', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lists the latest five transactions and links to the full list', async () => {
    const fetch = mockApi({ '/transactions': { data: [tx], meta } })
    renderWithProviders(<RecentTransactions />)
    expect(screen.getByText('Loading transactions…')).toBeInTheDocument()
    expect(await screen.findByText('Rent share')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/transactions')
    expect(fetch).toHaveBeenCalledWith('/api/transactions?limit=5', expect.anything())
  })

  it('opens the details of a transaction without fetching it again', async () => {
    const fetch = mockApi({ '/transactions': { data: [tx], meta } })
    renderWithProviders(<RecentTransactions />)
    await userEvent.click(await screen.findByRole('button', { name: /Rent share/ }))
    const drawer = screen.getByRole('dialog', { name: 'Transaction details' })
    expect(drawer).toHaveAttribute('open')
    expect(within(drawer).getByText('Transfer in from Kwame Mensah')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledOnce()

    await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }))
    expect(drawer).not.toHaveAttribute('open')
  })

  it('says when there are no transactions yet', async () => {
    mockApi({ '/transactions': { data: [], meta: { ...meta, total: 0 } } })
    renderWithProviders(<RecentTransactions />)
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
  })

  it('shows an error that can be retried', async () => {
    let calls = 0
    mockApi({ '/transactions': () => (calls++ === 0 ? serverError() : { data: [tx], meta }) })
    renderWithProviders(<RecentTransactions />)
    expect(await screen.findByText("We couldn't load your transactions")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Rent share')).toBeInTheDocument()
  })
})
