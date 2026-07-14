import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkdownPane } from './MarkdownPane'

// Small helper: render a pane with sensible defaults, allowing overrides
function renderPane(overrides: Partial<React.ComponentProps<typeof MarkdownPane>> = {}) {
  const props = {
    label: 'Model A',
    value: '# Hello',
    onLabelChange: vi.fn(),
    onValueChange: vi.fn(),
    ...overrides,
  }
  render(<MarkdownPane {...props} />)
  return props
}

describe('MarkdownPane', () => {
  it('renders markdown as HTML in preview mode by default', () => {
    renderPane({ value: '# Hello world' })
    // The heading should be rendered as an <h1>, not raw markdown text
    expect(
      screen.getByRole('heading', { level: 1, name: 'Hello world' }),
    ).toBeInTheDocument()
  })

  it('shows the editable label value', () => {
    renderPane({ label: 'Claude' })
    expect(screen.getByDisplayValue('Claude')).toBeInTheDocument()
  })

  it('calls onLabelChange when the label is edited', async () => {
    const user = userEvent.setup()
    const props = renderPane({ label: '' })
    const labelInput = screen.getByLabelText(/pane label/i)
    await user.type(labelInput, 'X')
    expect(props.onLabelChange).toHaveBeenCalledWith('X')
  })

  it('reveals a textarea when Edit is toggled', async () => {
    const user = userEvent.setup()
    renderPane()
    expect(screen.queryByRole('textbox', { name: /markdown/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('textbox', { name: /markdown/i })).toBeInTheDocument()
  })

  it('calls onValueChange when the textarea is edited', async () => {
    const user = userEvent.setup()
    const props = renderPane({ value: '' })
    await user.click(screen.getByRole('button', { name: /edit/i }))
    const textarea = screen.getByRole('textbox', { name: /markdown/i })
    await user.type(textarea, '!')
    expect(props.onValueChange).toHaveBeenCalledWith('!')
  })

  it('clears the content when Clear is clicked', async () => {
    const user = userEvent.setup()
    const props = renderPane({ value: '# Not empty' })
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(props.onValueChange).toHaveBeenCalledWith('')
  })

  it('reopens the editor when Clear is clicked from preview mode', async () => {
    const user = userEvent.setup()
    renderPane({ value: '# Not empty' })
    // Starts in preview: no textarea visible
    expect(screen.queryByRole('textbox', { name: /markdown/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(screen.getByRole('textbox', { name: /markdown/i })).toBeInTheDocument()
  })
})
