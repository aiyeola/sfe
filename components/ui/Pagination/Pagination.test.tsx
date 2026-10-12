import { render, screen, within } from '@testing-library/react'
import { Pagination, pageItems } from './Pagination'

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

describe('Pagination', () => {
  const hrefFor = (page: number) => `/transactions?page=${page}`

  it('links to neighbouring pages and marks the current one', () => {
    render(<Pagination page={6} totalPages={12} hrefFor={hrefFor} />)
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', hrefFor(5))
    expect(within(nav).getByRole('link', { name: 'Next page' })).toHaveAttribute('href', hrefFor(7))
    expect(within(nav).getByRole('link', { name: 'Page 6' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Page 5' })).not.toHaveAttribute('aria-current')
    expect(within(nav).getByText('Page 6 of 12')).toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} totalPages={12} hrefFor={hrefFor} />)
    expect(screen.queryByRole('link', { name: 'Previous page' })).toBeNull()
    expect(screen.getByLabelText('Previous page')).toHaveAttribute('aria-disabled', 'true')

    rerender(<Pagination page={12} totalPages={12} hrefFor={hrefFor} />)
    expect(screen.getByRole('link', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toHaveAttribute('aria-disabled', 'true')
  })
})
