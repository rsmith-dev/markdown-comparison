import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import {
  type ComparisonState,
  normalizeState,
} from './comparisonState'

// Marker for the URL hash that carries a shared comparison
const HASH_PREFIX = '#s='

// Compress the state to a compact, URL-safe string
export function encodeState(state: ComparisonState): string {
  return compressToEncodedURIComponent(JSON.stringify(state))
}

// Reverse of encodeState; returns null if the input can't be decoded to state
export function decodeState(encoded: string): ComparisonState | null {
  if (!encoded) return null
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return normalizeState(JSON.parse(json))
  } catch {
    return null
  }
}

// Build a shareable link that embeds the comparison in the URL hash.
// baseUrl lets tests pass a fixed origin; defaults to the current page.
export function buildShareUrl(
  state: ComparisonState,
  baseUrl: string = window.location.origin + window.location.pathname,
): string {
  return `${baseUrl}${HASH_PREFIX}${encodeState(state)}`
}

// Read a shared comparison from the current URL hash, if present
export function readSharedStateFromUrl(): ComparisonState | null {
  const { hash } = window.location
  if (!hash.startsWith(HASH_PREFIX)) return null
  return decodeState(hash.slice(HASH_PREFIX.length))
}

// Parse an imported JSON export back into state; null if invalid
export function parseImportedJson(text: string): ComparisonState | null {
  try {
    return normalizeState(JSON.parse(text))
  } catch {
    return null
  }
}
