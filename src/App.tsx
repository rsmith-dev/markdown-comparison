import { useEffect, useRef, useState } from 'react'
import { MarkdownPane } from './components/MarkdownPane'
import {
  type ComparisonState,
  DEFAULT_STATE,
  normalizeState,
} from './comparisonState'
import {
  buildShareUrl,
  parseImportedJson,
  readSharedStateFromUrl,
} from './share'
import './App.css'

// localStorage key for persisting the comparison across refreshes
export const STORAGE_KEY = 'markdown-comparison:v1'

// Read any previously saved comparison, falling back to empty defaults
function loadState(): ComparisonState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return normalizeState(JSON.parse(raw))
  } catch {
    // Ignore malformed/unavailable storage and start fresh
    return DEFAULT_STATE
  }
}

function App() {
  // A shared link (URL hash) takes precedence over local storage on first load
  const [state, setState] = useState<ComparisonState>(
    () => readSharedStateFromUrl() ?? loadState(),
  )

  // Open the panes in edit mode on first visit (nothing saved or shared yet)
  const [startInEdit] = useState(
    () =>
      readSharedStateFromUrl() === null &&
      localStorage.getItem(STORAGE_KEY) === null,
  )

  // Transient toolbar feedback (e.g. "Link copied")
  const [notice, setNotice] = useState('')
  // Hidden file input used by the Import button
  const importInputRef = useRef<HTMLInputElement>(null)

  // Persist on every change so a refresh restores the comparison
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Briefly show a toolbar message, then clear it
  const flashNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2000)
  }

  // Copy a self-contained share link (comparison encoded in the URL) to clipboard
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(state))
      flashNotice('Link copied')
    } catch {
      flashNotice('Copy failed')
    }
  }

  // Download the current comparison as a JSON file
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'comparison.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Load a previously exported JSON file back into the app
  const importJson = async (file: File) => {
    const imported = parseImportedJson(await file.text())
    if (imported) {
      setState(imported)
      flashNotice('Imported')
    } else {
      flashNotice('Invalid file')
    }
  }

  // Swap both content and labels between the two panes (prompt is unchanged)
  const swapSides = () => {
    setState((prev) => ({
      ...prev,
      leftLabel: prev.rightLabel,
      rightLabel: prev.leftLabel,
      leftText: prev.rightText,
      rightText: prev.leftText,
    }))
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Markdown Comparison</h1>
        <div className="app__toolbar">
          {notice && <span className="app__notice">{notice}</span>}
          <button type="button" onClick={swapSides}>
            Swap sides
          </button>
          <button type="button" onClick={copyShareLink}>
            Copy link
          </button>
          <button type="button" onClick={exportJson}>
            Export
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
          >
            Import
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="app__file-input"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) importJson(file)
              // Reset so selecting the same file again still fires onChange
              event.target.value = ''
            }}
          />
        </div>
      </header>

      <label className="app__prompt">
        <span className="app__prompt-label">Prompt used</span>
        <textarea
          className="app__prompt-input"
          placeholder="Paste the prompt you gave the models…"
          value={state.prompt}
          onChange={(event) =>
            setState((s) => ({ ...s, prompt: event.target.value }))
          }
        />
      </label>

      <main className="app__panes">
        <MarkdownPane
          label={state.leftLabel}
          value={state.leftText}
          defaultEditing={startInEdit}
          onLabelChange={(leftLabel) => setState((s) => ({ ...s, leftLabel }))}
          onValueChange={(leftText) => setState((s) => ({ ...s, leftText }))}
        />
        <MarkdownPane
          label={state.rightLabel}
          value={state.rightText}
          defaultEditing={startInEdit}
          onLabelChange={(rightLabel) => setState((s) => ({ ...s, rightLabel }))}
          onValueChange={(rightText) => setState((s) => ({ ...s, rightText }))}
        />
      </main>
    </div>
  )
}

export default App
