import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('is a non-submitting button that handles clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('ignores clicks while disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('supports icon-only buttons with an accessible label', () => {
    render(
      <Button
        iconLeft="close"
        iconRight="chevron-right"
        aria-label="Close"
        variant="ghost"
        size="sm"
        fullWidth
      />
    )
    const button = screen.getByRole('button', { name: 'Close' })
    expect(button).toHaveClass('ghost', 'sm', 'fullWidth')
    expect(button.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2)
  })
})
