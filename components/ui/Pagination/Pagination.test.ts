import { pageItems } from './Pagination'

describe('pageItems', () => {
  it('matches the design on the first page', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 'gap', 12])
  })

  it('windows around the current page with gaps on both sides', () => {
    expect(pageItems(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
  })

  it('clamps the window at the end', () => {
    expect(pageItems(12, 12)).toEqual([1, 'gap', 10, 11, 12])
  })

  it('shows a lone skipped page instead of a gap', () => {
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12])
    expect(pageItems(9, 12)).toEqual([1, 'gap', 8, 9, 10, 11, 12])
  })

  it('handles small totals', () => {
    expect(pageItems(1, 1)).toEqual([1])
    expect(pageItems(2, 2)).toEqual([1, 2])
    expect(pageItems(2, 4)).toEqual([1, 2, 3, 4])
  })
})
