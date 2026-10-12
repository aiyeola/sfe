import { act, render, renderHook, screen } from '@testing-library/react'
import { Money, useAmountsHidden } from './Money'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('Money', () => {
  it('formats minor units', () => {
    render(<Money amount={150050} currency="NGN" />)
    expect(screen.getByText('₦1,500.50')).toBeInTheDocument()
  })

  it('signs credits and debits', () => {
    render(
      <>
        <Money amount={1000} currency="USD" sign="credit" />
        <Money amount={1000} currency="USD" sign="debit" />
      </>
    )
    expect(screen.getByText('+$10.00')).toBeInTheDocument()
    expect(screen.getByText('-$10.00')).toBeInTheDocument()
  })

  it('masks every amount while hidden, and remembers it', () => {
    render(
      <>
        <Money amount={1000} currency="NGN" />
        <Money amount={2000} currency="GHS" />
      </>
    )
    const { result } = renderHook(() => useAmountsHidden())
    act(() => result.current.setHidden(true))
    expect(screen.getAllByLabelText('Amount hidden')).toHaveLength(2)
    expect(screen.queryByText('₦10.00')).toBeNull()
    expect(localStorage.getItem('amounts-hidden')).toBe('1')

    act(() => result.current.setHidden(false))
    expect(screen.getByText('₦10.00')).toBeInTheDocument()
  })

  it('follows changes made in another tab', () => {
    render(<Money amount={1000} currency="NGN" />)
    act(() => {
      localStorage.setItem('amounts-hidden', '1')
      window.dispatchEvent(new StorageEvent('storage', { key: 'amounts-hidden' }))
    })
    expect(screen.getByLabelText('Amount hidden')).toBeInTheDocument()
  })

  it('shows amounts when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(<Money amount={1000} currency="NGN" />)
    const { result } = renderHook(() => useAmountsHidden())
    act(() => result.current.setHidden(true))
    expect(screen.getByText('₦10.00')).toBeInTheDocument()
  })
})
