import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App, { STORAGE_KEY } from './App'
import { encodeState } from './share'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    // Reset the hash so a shared-link test doesn't leak into others
    window.location.hash = ''
  })

  it('renders two comparison panes', () => {
    render(<App />)
    expect(screen.getAllByLabelText('Pane label')).toHaveLength(2)
  })

  it('loads a shared comparison from the URL hash over localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ leftLabel: 'Local', rightLabel: 'Local' }),
    )
    window.location.hash =
      '#s=' +
      encodeState({
        prompt: '',
        leftLabel: 'Shared A',
        rightLabel: 'Shared B',
        leftText: '# From link',
        rightText: '# Also link',
      })
    render(<App />)
    expect(screen.getByDisplayValue('Shared A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Shared B')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'From link' })).toBeInTheDocument()
  })

  it('loads saved content and labels from localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        leftLabel: 'GPT',
        rightLabel: 'Claude',
        leftText: '# Left',
        rightText: '# Right',
      }),
    )
    render(<App />)
    expect(screen.getByDisplayValue('GPT')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Claude')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Left' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Right' })).toBeInTheDocument()
  })

  it('saves label edits to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)
    const [leftLabel] = screen.getAllByLabelText('Pane label')
    await user.type(leftLabel, 'Gemini')

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.leftLabel).toBe('Gemini')
  })

  it('saves the prompt to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)
    const promptBox = screen.getByLabelText(/prompt/i)
    await user.type(promptBox, 'Summarise this')

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.prompt).toBe('Summarise this')
  })

  it('swaps content and labels between panes when Swap is clicked', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        leftLabel: 'GPT',
        rightLabel: 'Claude',
        leftText: '# Left',
        rightText: '# Right',
      }),
    )
    render(<App />)

    await user.click(screen.getByRole('button', { name: /swap/i }))

    // Panes keep DOM order; after swap the first pane holds the old right values
    const [firstPane, secondPane] = screen.getAllByRole('region', {
      name: 'Comparison pane',
    })
    expect(within(firstPane).getByLabelText('Pane label')).toHaveValue('Claude')
    expect(within(firstPane).getByRole('heading')).toHaveTextContent('Right')
    expect(within(secondPane).getByLabelText('Pane label')).toHaveValue('GPT')
    expect(within(secondPane).getByRole('heading')).toHaveTextContent('Left')
  })
})
