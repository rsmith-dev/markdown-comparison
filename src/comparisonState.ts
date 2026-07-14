// Shared shape + defaults for a comparison, used by the app and share helpers.
export type ComparisonState = {
  prompt: string
  leftLabel: string
  rightLabel: string
  leftText: string
  rightText: string
}

export const DEFAULT_STATE: ComparisonState = {
  prompt: '',
  leftLabel: '',
  rightLabel: '',
  leftText: '',
  rightText: '',
}

// Merge an untrusted partial object onto the defaults, keeping every field a
// string. Used when reading from localStorage, a URL, or an imported file.
export function normalizeState(input: unknown): ComparisonState {
  if (typeof input !== 'object' || input === null) return DEFAULT_STATE
  const source = input as Record<string, unknown>
  const result = { ...DEFAULT_STATE }
  for (const key of Object.keys(DEFAULT_STATE) as (keyof ComparisonState)[]) {
    if (typeof source[key] === 'string') result[key] = source[key] as string
  }
  return result
}
