import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockApi, renderWithProviders } from '@/test-utils'
import { RatesWidget } from './RatesWidget'

const RATES: Record<string, number> = { USD: 1530.25, GHS: 98.4 }
const rate = (url: URL) => ({
  data: {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    rate: RATES[url.searchParams.get('from')!],
    updatedAt: '2026-10-12T12:00:00.000Z',
  },
})
const serverError = () => Response.json({ error: { code: 'INTERNAL', message: 'Boom' } }, { status: 500 })

describe('RatesWidget', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows each rate against the base currency, with when it was updated', async () => {
    const fetch = mockApi({ '/rates': rate })
    renderWithProviders(<RatesWidget base="NGN" />)
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
    expect(await screen.findByText('1530.25 NGN')).toBeInTheDocument()
    expect(screen.getByText('98.4 NGN')).toBeInTheDocument()
    expect(screen.getByText(/^Updated \d{2}:\d{2}$/)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/rates?from=GHS&to=NGN', expect.anything())
  })

  it('shows an error when a rate fails, and retries only the failed one', async () => {
    let ghsCalls = 0
    const fetch = mockApi({
      '/rates': (url) =>
        url.searchParams.get('from') === 'GHS' && ghsCalls++ === 0 ? serverError() : rate(url),
    })
    renderWithProviders(<RatesWidget base="NGN" />)
    expect(await screen.findByText("We couldn't load rates")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('98.4 NGN')).toBeInTheDocument()
    expect(screen.getByText('1530.25 NGN')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})
