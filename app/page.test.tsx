import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from '@/types/api'
import { mockApi, renderWithProviders } from '@/test-utils'
import DashboardPage from './page'

const user: User = {
  id: 'usr_1',
  firstName: 'Ada',
  lastName: 'Obi',
  email: 'ada@example.com',
  avatarUrl: null,
  tier: 'verified',
  wallets: [
    { currency: 'NGN', balance: 150050 },
    { currency: 'USD', balance: 4599 },
  ],
}
const api = {
  '/transactions': { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } },
  '/rates': (url: URL) => ({
    data: {
      from: url.searchParams.get('from'),
      to: 'NGN',
      rate: 1530.25,
      updatedAt: '2026-10-12T12:00:00.000Z',
    },
  }),
}
const serverError = () => Response.json({ error: { code: 'INTERNAL', message: 'Boom' } }, { status: 500 })

describe('DashboardPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('greets the user and shows their wallets once the account loads', async () => {
    mockApi({ ...api, '/me': { data: user } })
    renderWithProviders(<DashboardPage />)
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText('Loading your account…')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: 'Welcome back, Ada' })).toBeInTheDocument()
    expect(screen.getByText('Total balance')).toBeInTheDocument()
    expect(screen.getByText('NGN wallet')).toBeInTheDocument()
    expect(screen.getByText('USD wallet')).toBeInTheDocument()
    expect(screen.getByText('$45.99')).toBeInTheDocument()
    expect(screen.queryByText('Loading your account…')).not.toBeInTheDocument()
  })

  it('shows recent transactions and rates alongside the account', async () => {
    mockApi({ ...api, '/me': { data: user } })
    renderWithProviders(<DashboardPage />)
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
    expect(await screen.findAllByText('1530.25 NGN')).toHaveLength(2)
  })

  it('lets the user retry when the account fails to load', async () => {
    let calls = 0
    mockApi({ ...api, '/me': () => (calls++ === 0 ? serverError() : { data: user }) })
    renderWithProviders(<DashboardPage />)
    expect(await screen.findByText("We couldn't load your account")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Welcome back, Ada' })).toBeInTheDocument()
  })
})
