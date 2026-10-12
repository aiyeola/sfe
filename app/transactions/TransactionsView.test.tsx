import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import type { OnUrlUpdateFunction } from 'nuqs/adapters/testing'
import type { Transaction } from '@/types/api'
import { mockApi, renderWithProviders } from '@/test-utils'
import { TransactionsView } from './TransactionsView'

const nav = vi.hoisted(() => ({ searchParams: new URLSearchParams() }))
vi.mock('next/navigation', () => ({ useSearchParams: () => nav.searchParams }))

const tx = (id: string): Transaction => ({
  id,
  reference: `REF-${id}`,
  type: 'transfer_out',
  status: 'successful',
  currency: 'NGN',
  amount: 500000,
  fee: 0,
  narration: `Narration ${id}`,
  counterparty: 'Kwame Mensah',
  createdAt: new Date().toISOString(),
})

const listOf = (data: Transaction[], meta: object = {}) => ({
  data,
  meta: { page: 1, limit: 20, total: data.length, totalPages: 1, ...meta },
})

const serverError = () => Response.json({ error: { code: 'INTERNAL', message: 'Boom' } }, { status: 500 })

const lastUrl = (onUrlUpdate: ReturnType<typeof vi.fn<OnUrlUpdateFunction>>) => onUrlUpdate.mock.lastCall![0]

const requested = (fetch: ReturnType<typeof mockApi>) =>
  fetch.mock.calls.map(([input]) => new URL(String(input), 'http://localhost').searchParams)

describe('TransactionsView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    nav.searchParams = new URLSearchParams()
  })

  it('lists transactions with a total and pagination that keeps other params', async () => {
    nav.searchParams = new URLSearchParams('__scenario=slow')
    mockApi({ '/transactions': listOf([tx('a'), tx('b')], { total: 45, totalPages: 3 }) })
    renderWithProviders(<TransactionsView />)
    expect(screen.getByText('Loading transactions…')).toBeInTheDocument()
    expect(await screen.findByText('Narration a')).toBeInTheDocument()
    expect(screen.getByText('45 transactions')).toBeInTheDocument()
    expect(screen.getByText('Showing 1–20 of 45')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute(
      'href',
      '/transactions?__scenario=slow&page=2'
    )
  })

  it('requests the page and filters in the URL', async () => {
    const fetch = mockApi({ '/transactions': listOf([tx('a')], { page: 2, total: 21, totalPages: 2 }) })
    renderWithProviders(<TransactionsView />, {
      searchParams: '?page=2&q=kwame&type=transfer_out&status=successful',
    })
    expect(await screen.findByText('21 results')).toBeInTheDocument()
    expect(Object.fromEntries(requested(fetch)[0])).toEqual({
      page: '2',
      limit: '20',
      q: 'kwame',
      type: 'transfer_out',
      status: 'successful',
    })
    expect(screen.getByRole('searchbox')).toHaveValue('kwame')
    expect(screen.getByLabelText('Type')).toHaveValue('transfer_out')
    expect(screen.getByLabelText('Status')).toHaveValue('successful')
    expect(screen.getByText('Showing 21–21 of 21')).toBeInTheDocument()
  })

  it('says when there are no transactions yet', async () => {
    mockApi({ '/transactions': listOf([]) })
    renderWithProviders(<TransactionsView />)
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
    expect(screen.getByText('0 transactions')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
  })

  it('offers to clear filters when nothing matches', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    mockApi({ '/transactions': (url) => listOf(url.searchParams.has('q') ? [] : [tx('a')]) })
    renderWithProviders(<TransactionsView />, { searchParams: '?q=zzz&status=failed', onUrlUpdate })
    const empty = await screen.findByRole('status')
    expect(empty).toHaveTextContent('No transactions match your filters')
    expect(screen.getByText('0 results')).toBeInTheDocument()
    fireEvent.click(within(empty).getByRole('button', { name: 'Clear filters' }))
    expect(await screen.findByText('Narration a')).toBeInTheDocument()
    expect(lastUrl(onUrlUpdate).queryString).toBe('')
    expect(lastUrl(onUrlUpdate).options.history).toBe('push')
  })

  it('goes back to page 1 when a filter changes', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    const fetch = mockApi({ '/transactions': listOf([tx('a')], { page: 3, total: 41, totalPages: 3 }) })
    renderWithProviders(<TransactionsView />, { searchParams: '?page=3', onUrlUpdate })
    await screen.findByText('Narration a')
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'deposit' } })
    await waitFor(() => expect(lastUrl(onUrlUpdate).queryString).toBe('?type=deposit'))
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'pending' } })
    await waitFor(() => expect(lastUrl(onUrlUpdate).queryString).toBe('?type=deposit&status=pending'))
    await waitFor(() => expect(requested(fetch).at(-1)?.get('status')).toBe('pending'))
    expect(requested(fetch).at(-1)?.get('page')).toBe('1')
  })

  it('commits a search without adding a history entry', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    mockApi({ '/transactions': listOf([tx('a')]) })
    renderWithProviders(<TransactionsView />, { onUrlUpdate })
    await screen.findByText('Narration a')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'kwame' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(lastUrl(onUrlUpdate).queryString).toBe('?q=kwame'))
    expect(lastUrl(onUrlUpdate).options.history).toBe('replace')
    expect(await screen.findByText('1 result')).toBeInTheDocument()
  })

  it('moves a link past the last page to the last page', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    mockApi({
      '/transactions': (url) =>
        listOf([tx(`p${url.searchParams.get('page')}`)], { page: 3, total: 41, totalPages: 3 }),
    })
    renderWithProviders(<TransactionsView />, { searchParams: '?page=9', onUrlUpdate })
    expect(await screen.findByText('Narration p3')).toBeInTheDocument()
    expect(lastUrl(onUrlUpdate).queryString).toBe('?page=3')
    expect(screen.queryByText('Narration p9')).toBeNull()
  })

  it('shows an error with a retry', async () => {
    const fetch = mockApi({ '/transactions': serverError })
    renderWithProviders(<TransactionsView />)
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your transactions")
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
    fetch.mockResolvedValue(Response.json(listOf([tx('a')])))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Narration a')).toBeInTheDocument()
  })

  it('opens details from a row, and Back closes them', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    const back = vi.spyOn(history, 'back').mockImplementation(() => {})
    const fetch = mockApi({ '/transactions': listOf([tx('a')]) })
    renderWithProviders(<TransactionsView />, { onUrlUpdate })
    fireEvent.click(await screen.findByRole('button', { name: /Narration a/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Transaction details' })
    expect(within(dialog).getByText('REF-a')).toBeInTheDocument()
    expect(lastUrl(onUrlUpdate)).toMatchObject({ queryString: '?tx=a', options: { history: 'push' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(back).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('drops ?tx= on close when details were opened from a link', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    const back = vi.spyOn(history, 'back')
    mockApi({ '/transactions/b': { data: tx('b') }, '/transactions': listOf([tx('a')]) })
    renderWithProviders(<TransactionsView />, { searchParams: '?tx=b', onUrlUpdate })
    const dialog = await screen.findByRole('dialog', { name: 'Transaction details' })
    expect(await within(dialog).findByText('REF-b')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(lastUrl(onUrlUpdate).queryString).toBe(''))
    expect(back).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
