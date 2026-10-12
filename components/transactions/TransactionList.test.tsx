import { fireEvent, render, screen, within } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { formatDate } from '@/lib/format'
import { TransactionList, TransactionListSkeleton } from './TransactionList'

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const tx = (id: string, createdAt: string): Transaction => ({
  id,
  reference: `REF-${id}`,
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 4599,
  fee: 0,
  narration: `Narration ${id}`,
  counterparty: null,
  createdAt,
})

describe('TransactionList', () => {
  it('groups transactions under Today, Yesterday and dated headings', () => {
    const older = '2026-01-15T12:00:00.000Z'
    render(
      <TransactionList
        transactions={[tx('a', daysAgo(0)), tx('b', daysAgo(0)), tx('c', daysAgo(1)), tx('d', older)]}
        onSelect={vi.fn()}
      />
    )
    const headings = screen.getAllByRole('heading').map((h) => h.textContent)
    expect(headings).toEqual(['Today', 'Yesterday', formatDate(older)])
    const today = screen.getByRole('region', { name: 'Today' })
    expect(within(today).getAllByRole('button')).toHaveLength(2)
  })

  it('reports the clicked transaction', () => {
    const onSelect = vi.fn()
    const b = tx('b', daysAgo(0))
    render(<TransactionList transactions={[tx('a', daysAgo(0)), b]} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Narration b/ }))
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(b)
  })
})

describe('TransactionListSkeleton', () => {
  it('announces loading and renders the requested placeholder rows', () => {
    const { container } = render(<TransactionListSkeleton rows={3} heading={false} />)
    expect(screen.getByText('Loading transactions…')).toBeInTheDocument()
    expect(container.querySelectorAll('.skeletonRow')).toHaveLength(3)
    expect(container.querySelector('.day')).toBeNull()
  })
})
