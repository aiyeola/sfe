import { createLoader } from 'nuqs'
import { filterParsers, serializeFilters } from './searchParams'

const parse = createLoader(filterParsers)
const sp = (qs: string) => new URLSearchParams(qs)

describe('filterParsers', () => {
  it('reads valid params', () => {
    expect(parse(sp('page=3&q=netflix&type=card_payment&status=failed&tx=txn_1'))).toEqual({
      page: 3,
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      tx: 'txn_1',
    })
  })

  it('falls back to defaults for invalid input', () => {
    for (const page of ['0', '-1', '2.5', 'abc', '']) expect(parse(sp(`page=${page}`)).page).toBe(1)
    expect(parse(sp('type=reversed&status=toString'))).toMatchObject({ type: null, status: null })
  })
})

describe('serializeFilters', () => {
  it('keeps params it does not own, such as __scenario', () => {
    expect(serializeFilters(sp('__scenario=slow&page=2'), { tx: 'txn_1' })).toBe(
      '?__scenario=slow&page=2&tx=txn_1'
    )
  })

  it('removes cleared keys and the default page', () => {
    expect(serializeFilters(sp('q=net&type=deposit&page=3'), { q: null, type: null, page: null })).toBe('')
    expect(serializeFilters(sp('page=2'), { page: 1 })).toBe('')
  })
})
