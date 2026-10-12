import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('shows the image with its alt text', () => {
    render(<Avatar src="https://cdn.example/ada.png" alt="Ada Lovelace" size="lg" />)
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
      'src',
      'https://cdn.example/ada.png'
    )
  })

  it('falls back to a blank placeholder without a source', () => {
    const { container } = render(<Avatar src={null} alt="Ada Lovelace" />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.firstChild).toHaveClass('avatar', 'md')
  })
})
