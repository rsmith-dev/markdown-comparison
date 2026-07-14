import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import './MarkdownPane.css'

type MarkdownPaneProps = {
  /** Editable label shown above the pane (e.g. the model name) */
  label: string
  /** The raw markdown text for this pane */
  value: string
  /** Whether the pane should start in edit mode (defaults to preview) */
  defaultEditing?: boolean
  /** Called with the new label when the user edits it */
  onLabelChange: (label: string) => void
  /** Called with the new markdown when the user edits or clears it */
  onValueChange: (value: string) => void
}

/**
 * A single comparison pane: an editable label, an edit/preview toggle,
 * a clear button, and either a raw markdown textarea (edit) or the
 * rendered markdown (preview).
 */
export function MarkdownPane({
  label,
  value,
  defaultEditing = false,
  onLabelChange,
  onValueChange,
}: MarkdownPaneProps) {
  // Local UI state: whether this pane is showing the raw editor or the preview
  const [isEditing, setIsEditing] = useState(defaultEditing)

  // Clear the content and drop back into the editor so it's ready to paste
  const handleClear = () => {
    onValueChange('')
    setIsEditing(true)
  }

  return (
    <section className="pane" aria-label="Comparison pane">
      <header className="pane__header">
        <input
          className="pane__label"
          type="text"
          aria-label="Pane label"
          placeholder="Label (e.g. model name)"
          value={label}
          onChange={(event) => onLabelChange(event.target.value)}
        />
        <div className="pane__actions">
          <button
            type="button"
            onClick={() => setIsEditing((editing) => !editing)}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <button type="button" onClick={handleClear}>
            Clear
          </button>
        </div>
      </header>

      {isEditing ? (
        <textarea
          className="pane__editor"
          aria-label="Markdown input"
          placeholder="Paste markdown here…"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      ) : (
        // react-markdown ignores raw HTML by default, so pasted content
        // cannot inject scripts (safe against XSS). remark-breaks keeps single
        // line breaks so plain text renders as typed, alongside full markdown.
        <div className="pane__preview">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {value}
          </ReactMarkdown>
        </div>
      )}
    </section>
  )
}
