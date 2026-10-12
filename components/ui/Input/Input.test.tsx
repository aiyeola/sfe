import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('is labelled and accepts typing', async () => {
    render(<Input label="Search" leadingIcon="search" placeholder="Reference or narration" />)
    const input = screen.getByRole('textbox', { name: 'Search' })
    await userEvent.type(input, 'ACM')
    expect(input).toHaveValue('ACM')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).toHaveClass('withIcon')
  })

  it('marks itself invalid and shows the error', () => {
    render(<Input label="Amount" id="amount" error="Enter an amount" hint="In naira" />)
    const input = screen.getByRole('textbox', { name: 'Amount' })
    expect(input).toHaveAttribute('id', 'amount')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Enter an amount')).toBeInTheDocument()
    expect(screen.queryByText('In naira')).toBeNull()
  })
})
