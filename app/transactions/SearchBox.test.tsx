import { act, fireEvent, render, screen } from '@testing-library/react'
import { SearchBox } from './SearchBox'

const type = (text: string) => {
  const input = screen.getByRole('searchbox')
  for (let i = 1; i <= text.length; i++) {
    fireEvent.change(input, { target: { value: text.slice(0, i) } })
    act(() => vi.advanceTimersByTime(50))
  }
}

describe('SearchBox', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('commits once, after typing pauses', () => {
    const onCommit = vi.fn()
    render(<SearchBox value="" onCommit={onCommit} />)
    type('netflix')
    expect(onCommit).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(300))
    expect(onCommit).toHaveBeenCalledExactlyOnceWith('netflix')
  })

  it('commits immediately on Enter and when cleared', () => {
    const onCommit = vi.fn()
    render(<SearchBox value="old" onCommit={onCommit} />)
    type('net')
    fireEvent.submit(screen.getByRole('search'))
    expect(onCommit).toHaveBeenLastCalledWith('net')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } })
    expect(onCommit).toHaveBeenLastCalledWith('')
  })

  it('keeps typing that continued after its own commit landed in the URL', () => {
    const onCommit = vi.fn()
    const { rerender } = render(<SearchBox value="" onCommit={onCommit} />)
    type('net')
    act(() => vi.advanceTimersByTime(300))
    type('netf')
    rerender(<SearchBox value="net" onCommit={onCommit} />) // URL catches up with the first commit
    expect(screen.getByRole('searchbox')).toHaveValue('netf')
  })

  it('shows the URL value when it changes from outside (Back, Clear filters)', () => {
    const { rerender } = render(<SearchBox value="netflix" onCommit={vi.fn()} />)
    rerender(<SearchBox value="" onCommit={vi.fn()} />)
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })
})
