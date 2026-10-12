import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('opens as a dialog named by its title, with content and footer', () => {
    render(
      <Drawer
        open
        title="Transaction details"
        onClose={() => {}}
        footer={<button type="button">Copy</button>}
      >
        <p>ACM-1</p>
      </Drawer>
    )
    const dialog = screen.getByRole('dialog', { name: 'Transaction details' })
    expect(dialog).toHaveAttribute('open')
    expect(screen.getByText('ACM-1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('renders nothing inside until first opened', () => {
    render(
      <Drawer open={false} title="Details" onClose={() => {}}>
        <p>Body</p>
      </Drawer>
    )
    expect(screen.queryByText('Body')).toBeNull()
  })

  it('closes from the close button and the backdrop, not from clicks inside', async () => {
    const onClose = vi.fn()
    render(
      <Drawer open title="Details" onClose={onClose}>
        <p>Body</p>
      </Drawer>
    )
    await userEvent.click(screen.getByText('Body'))
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('reports a close the browser initiated, such as Escape', () => {
    const onClose = vi.fn()
    render(
      <Drawer open title="Details" onClose={onClose}>
        <p>Body</p>
      </Drawer>
    )
    fireEvent(screen.getByRole('dialog'), new Event('close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes quietly when the parent closes it, keeping the last content while it animates out', () => {
    const onClose = vi.fn()
    const { rerender, container } = render(
      <Drawer open title="Details" onClose={onClose} footer={<span>Footer</span>}>
        <p>Body</p>
      </Drawer>
    )
    rerender(
      <Drawer open={false} title="Details" onClose={onClose}>
        {null}
      </Drawer>
    )
    expect(container.querySelector('dialog')).not.toHaveAttribute('open')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})
