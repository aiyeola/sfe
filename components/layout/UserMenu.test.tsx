import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from '@/types/api'
import { mockApi, renderWithProviders } from '@/test-utils'
import { UserMenu } from './UserMenu'

const user: User = {
  id: 'usr_1',
  firstName: 'Ada',
  lastName: 'Obi',
  email: 'ada@example.com',
  avatarUrl: 'https://cdn.example/ada.png',
  tier: 'verified',
  wallets: [],
}

afterEach(() => vi.restoreAllMocks())

describe('UserMenu', () => {
  it('shows the user and toggles their details', async () => {
    mockApi({ '/me': { data: user } })
    const { container } = renderWithProviders(<UserMenu />)
    const trigger = await screen.findByRole('button', { name: 'Ada' })
    expect(container.querySelector('img')).toHaveAttribute('src', user.avatarUrl)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Ada Obi')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Verified account')).toBeInTheDocument()

    await userEvent.click(trigger)
    expect(screen.queryByText('ada@example.com')).toBeNull()
  })

  it('closes on Escape and on a click outside', async () => {
    mockApi({ '/me': { data: user } })
    renderWithProviders(<UserMenu />)
    const trigger = await screen.findByRole('button', { name: 'Ada' })

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    await userEvent.click(screen.getByText('ada@example.com'))
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('still opens with a blank avatar when the user fails to load', async () => {
    const fetch = mockApi({})
    const { container } = renderWithProviders(<UserMenu />)
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(container.querySelector('img')).toBeNull()
    await userEvent.click(screen.getByRole('button'))
    expect(screen.queryByText(/account$/)).toBeNull()
  })
})
