import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  it('is decorative by default', () => {
    const { container } = render(<Icon name="search" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('is an image when labelled', () => {
    render(<Icon name="alert" label="Warning" size={16} />)
    const icon = screen.getByRole('img', { name: 'Warning' })
    expect(icon).not.toHaveAttribute('aria-hidden')
    expect(icon).toHaveAttribute('width', '16')
  })
})
