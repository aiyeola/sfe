import { render, screen } from '@testing-library/react'
import { Card, CardHeader } from './Card'

describe('Card', () => {
  it('renders a section labelled by its header', () => {
    render(
      <Card aria-labelledby="balances">
        <CardHeader id="balances" title="Balances" action={<button type="button">View all</button>} />
      </Card>
    )
    expect(screen.getByRole('region', { name: 'Balances' })).toHaveClass('card', 'md')
    expect(screen.getByRole('heading', { level: 2, name: 'Balances' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
  })
})
