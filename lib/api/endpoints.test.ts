import { mockApi } from '@/test-utils'
import { convert, getMe, getRate, getTransaction, getTransactions } from './endpoints'

const calledUrl = (fetch: ReturnType<typeof mockApi>) => String(fetch.mock.calls[0][0])

describe('endpoints', () => {
  afterEach(() => vi.restoreAllMocks())

  it('drops undefined and empty query params', async () => {
    const fetch = mockApi({ '/transactions': { data: [] } })
    await getTransactions({ page: 2, q: '', type: undefined, status: 'failed' })
    expect(calledUrl(fetch)).toBe('/api/transactions?page=2&status=failed')
  })

  it('omits the query string when there are no params', async () => {
    const fetch = mockApi({ '/transactions': { data: [] } })
    await getTransactions()
    expect(calledUrl(fetch)).toBe('/api/transactions')
  })

  it('encodes the transaction id', async () => {
    const fetch = mockApi({ '/transactions': { data: {} } })
    await getTransaction('txn/1 ?x')
    expect(calledUrl(fetch)).toBe('/api/transactions/txn%2F1%20%3Fx')
  })

  it('asks for a rate by currency pair', async () => {
    const fetch = mockApi({ '/rates': { data: {} } })
    await getRate('USD', 'NGN')
    expect(calledUrl(fetch)).toBe('/api/rates?from=USD&to=NGN')
  })

  it('passes request options through', async () => {
    const fetch = mockApi({ '/me': { data: {} } })
    const { signal } = new AbortController()
    await getMe({ signal })
    expect(fetch.mock.calls[0][1]).toMatchObject({ signal })
  })

  it('posts a conversion as JSON', async () => {
    const fetch = mockApi({ '/convert': { data: {} } })
    await convert({ from: 'USD', to: 'NGN', amount: 1999 })
    expect(calledUrl(fetch)).toBe('/api/convert')
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ from: 'USD', to: 'NGN', amount: 1999 }),
    })
  })
})
