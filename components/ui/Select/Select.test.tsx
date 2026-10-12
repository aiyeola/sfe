import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const options = [
  { value: '', label: 'All statuses' },
  { value: 'failed', label: 'Failed' },
]

describe('Select', () => {
  it('lists its options under a label and reports changes', async () => {
    const onChange = vi.fn()
    render(<Select label="Status" options={options} onChange={onChange} />)
    const select = screen.getByRole('combobox', { name: 'Status' })
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['All statuses', 'Failed'])
    await userEvent.selectOptions(select, 'Failed')
    expect(select).toHaveValue('failed')
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('uses a given id', () => {
    render(<Select label="Status" id="status" options={options} hideLabel />)
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveAttribute('id', 'status')
  })
})
