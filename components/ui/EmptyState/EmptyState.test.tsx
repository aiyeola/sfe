import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState, ErrorState } from './EmptyState'

describe('EmptyState', () => {
  it('announces politely with its title, text and action', () => {
    render(
      <EmptyState
        icon="inbox"
        title="No transactions"
        action={<button type="button">Add money</button>}
        compact
      >
        Your activity will show up here.
      </EmptyState>
    )
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('No transactions')
    expect(status).toHaveTextContent('Your activity will show up here.')
    expect(status).toHaveClass('compact')
    expect(screen.getByRole('button', { name: 'Add money' })).toBeInTheDocument()
  })

  it('renders just the title when nothing else is given', () => {
    render(<EmptyState icon="inbox" title="Nothing here" />)
    expect(screen.getByRole('status')).toHaveTextContent(/^Nothing here$/)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('ErrorState', () => {
  it('raises an alert with a retry', async () => {
    const onRetry = vi.fn()
    render(<ErrorState title="Couldn't load transactions" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load transactions")
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
