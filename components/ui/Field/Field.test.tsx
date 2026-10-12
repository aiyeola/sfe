import { render, screen } from '@testing-library/react'
import { Field } from './Field'

describe('Field', () => {
  it('labels its control and shows the hint', () => {
    render(
      <Field label="Amount" htmlFor="amount" hint="Minimum ₦100">
        <input id="amount" />
      </Field>
    )
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Minimum ₦100')).toBeInTheDocument()
  })

  it('shows the error in place of the hint', () => {
    render(
      <Field label="Amount" htmlFor="amount" hint="Minimum ₦100" error="Too low">
        <input id="amount" />
      </Field>
    )
    expect(screen.getByText('Too low')).toBeInTheDocument()
    expect(screen.queryByText('Minimum ₦100')).toBeNull()
  })

  it('can hide the label visually but keep it accessible', () => {
    render(
      <Field label="Search" htmlFor="q" hideLabel>
        <input id="q" />
      </Field>
    )
    expect(screen.getByText('Search')).toHaveClass('visually-hidden')
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })
})
