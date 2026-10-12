import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Conversion, User } from '@/types/api'
import { mockApi, renderWithProviders } from '@/test-utils'
import ConvertPage from './page'

const user: Pick<User, 'firstName' | 'wallets'> = {
  firstName: 'Ada',
  wallets: [
    { currency: 'NGN', balance: 150050 },
    { currency: 'USD', balance: 4599 },
  ],
}
const RATES: Record<string, number> = { 'USD-NGN': 1530.25, 'NGN-GHS': 0.0065 }
const rate = (url: URL) => {
  const [from, to] = [url.searchParams.get('from'), url.searchParams.get('to')]
  return { data: { from, to, rate: RATES[`${from}-${to}`] ?? 1, updatedAt: '2026-10-12T12:00:00.000Z' } }
}
const conversion: Conversion = {
  id: 'txn_cnv1',
  from: 'USD',
  to: 'NGN',
  amount: 1999,
  fee: 30,
  rate: 1530.25,
  received: 3058969,
  status: 'successful',
}

const setup = (convert: object = { data: conversion }) => {
  const fetch = mockApi({ '/me': { data: user }, '/rates': rate, '/convert': convert })
  renderWithProviders(<ConvertPage />)
  return { fetch, user: userEvent.setup() }
}
const summary = (term: string) => screen.getByText(term).nextElementSibling
const convertButton = () => screen.getByRole('button', { name: /Convert|Converting/ })

describe('ConvertPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows the balance of the source wallet', async () => {
    const { user } = setup()
    expect(screen.getByText('Balance: …')).toBeInTheDocument()
    expect(await screen.findByText('$45.99')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('From'), 'NGN')
    expect(screen.getByText('₦1,500.50')).toBeInTheDocument()
  })

  it('quotes the rate, fee and amount received as the user types', async () => {
    const { user } = setup()
    expect(summary('Rate')).toHaveTextContent('…')
    expect(await screen.findByText('1 USD = 1530.25 NGN')).toBeInTheDocument()
    expect(convertButton()).toBeDisabled()

    await user.type(screen.getByLabelText('Amount'), '19.99')
    expect(summary('Fee (1.5%)')).toHaveTextContent('$0.30')
    expect(summary('You get')).toHaveTextContent('₦30,589.69')
    expect(convertButton()).toBeEnabled()
  })

  it('requotes when the currencies change', async () => {
    const { user } = setup()
    await user.selectOptions(screen.getByLabelText('From'), 'NGN')
    await user.selectOptions(screen.getByLabelText('To'), 'GHS')
    expect(await screen.findByText('1 NGN = 0.0065 GHS')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Amount'), '1000')
    expect(summary('You get')).toHaveTextContent('GH₵6.50')
  })

  it('will not convert a currency into itself', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('Amount'), '10')
    await user.selectOptions(screen.getByLabelText('To'), 'USD')
    expect(convertButton()).toBeDisabled()
  })

  it('converts, confirms what was received and clears the amount', async () => {
    const { fetch, user } = setup()
    await screen.findByText('1 USD = 1530.25 NGN')
    await user.type(screen.getByLabelText('Amount'), '19.99')
    await user.click(convertButton())

    expect(await screen.findByText(/Conversion successful/)).toHaveTextContent(
      'Conversion successful. You received ₦30,589.69.'
    )
    expect(screen.getByLabelText('Amount')).toHaveValue(null)
    const [, init] = fetch.mock.calls.find(([url]) => String(url).endsWith('/convert'))!
    expect(JSON.parse(String(init?.body))).toEqual({ from: 'USD', to: 'NGN', amount: 1999 })
  })

  it('disables the button while converting', async () => {
    const { fetch, user } = setup()
    await user.type(screen.getByLabelText('Amount'), '19.99')
    fetch.mockImplementationOnce(() => new Promise(() => {}))
    await user.click(convertButton())
    expect(convertButton()).toHaveTextContent('Converting…')
    expect(convertButton()).toBeDisabled()
  })

  it('shows why a conversion failed and keeps the amount', async () => {
    const { user } = setup(() =>
      Response.json({ error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' } }, { status: 422 })
    )
    await user.type(screen.getByLabelText('Amount'), '500')
    await user.click(convertButton())
    expect(await screen.findByText('Insufficient funds')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toHaveValue(500)
    expect(screen.queryByText(/Conversion successful/)).not.toBeInTheDocument()
    expect(convertButton()).toHaveAccessibleName('Convert')
  })
})
