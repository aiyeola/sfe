import { hasFilters, parseFilters, withParams } from './searchParams'

const sp = (qs: string) => new URLSearchParams(qs)

describe('parseFilters', () => {
  it('reads valid params', () => {
    expect(parseFilters(sp('page=3&q=%20netflix%20&type=card_payment&status=failed&tx=txn_1'))).toEqual({
      page: 3,
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      tx: 'txn_1',
    })
  })

  it('falls back to defaults for invalid input', () => {
    for (const page of ['0', '-1', '2.5', 'abc', '']) expect(parseFilters(sp(`page=${page}`)).page).toBe(1)
    const filters = parseFilters(sp('type=reversed&status=toString&tx='))
    expect(filters).toEqual({ page: 1, q: '', type: undefined, status: undefined, tx: undefined })
    expect(hasFilters(filters)).toBe(false)
  })
})

describe('withParams', () => {
  it('keeps params it does not own, such as __scenario', () => {
    expect(withParams(sp('__scenario=slow&page=2'), { tx: 'txn_1' })).toBe('?__scenario=slow&page=2&tx=txn_1')
  })

  it('resets the page when a filter changes', () => {
    expect(withParams(sp('page=4&type=deposit'), { status: 'pending' })).toBe('?type=deposit&status=pending')
  })

  it('removes cleared keys and the default page', () => {
    expect(withParams(sp('q=net&type=deposit&page=3'), { q: null, type: null, status: null })).toBe('')
    expect(withParams(sp('page=2'), { page: 1 })).toBe('')
  })
})
