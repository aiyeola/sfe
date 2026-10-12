import { act, renderHook } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('only settles on the last value once changes stop for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: '' },
    })
    for (const value of ['n', 'ne', 'net']) {
      rerender({ value })
      act(() => vi.advanceTimersByTime(100))
    }
    expect(result.current).toBe('')

    // 100ms of the last value's 300ms have already passed inside the loop.
    act(() => vi.advanceTimersByTime(199))
    expect(result.current).toBe('')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('net')
  })
})
