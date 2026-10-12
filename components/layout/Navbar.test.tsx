import { screen, within } from '@testing-library/react'
import { mockApi, renderWithProviders } from '@/test-utils'
import { Navbar } from './Navbar'

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname }))

beforeEach(() => mockApi({}))
afterEach(() => vi.restoreAllMocks())

describe('Navbar', () => {
  it('links to each section and marks the current page', () => {
    usePathname.mockReturnValue('/transactions')
    renderWithProviders(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((l) => l.getAttribute('href'))
    ).toEqual(['/', '/transactions', '/convert'])
    expect(within(nav).getByRole('link', { name: 'Transactions' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('links the logo home and includes the user menu', () => {
    usePathname.mockReturnValue('/')
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: 'acme.wallet' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument()
  })
})
