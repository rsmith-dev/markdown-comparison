import { describe, it, expect } from 'vitest'
import {
  encodeState,
  decodeState,
  buildShareUrl,
  parseImportedJson,
} from './share'
import { DEFAULT_STATE } from './comparisonState'

const sample = {
  prompt: 'Summarise the article',
  leftLabel: 'GPT',
  rightLabel: 'Claude',
  leftText: '# Left\nsome *markdown*',
  rightText: '# Right\nmore text',
}

describe('share', () => {
  it('round-trips state through encode/decode', () => {
    const decoded = decodeState(encodeState(sample))
    expect(decoded).toEqual(sample)
  })

  it('returns null when decoding garbage', () => {
    expect(decodeState('not-valid-compressed')).toBeNull()
    expect(decodeState('')).toBeNull()
  })

  it('builds a share URL containing the encoded payload in the hash', () => {
    const url = buildShareUrl(sample, 'https://example.com/app/')
    expect(url).toContain('#s=')
    // The encoded portion should decode back to the original state
    const encoded = url.split('#s=')[1]
    expect(decodeState(encoded)).toEqual(sample)
  })

  it('parses valid imported JSON, coercing missing fields to defaults', () => {
    const json = JSON.stringify({ prompt: 'hi', leftText: '# x' })
    expect(parseImportedJson(json)).toEqual({
      ...DEFAULT_STATE,
      prompt: 'hi',
      leftText: '# x',
    })
  })

  it('returns null for invalid imported JSON', () => {
    expect(parseImportedJson('{ not json')).toBeNull()
  })
})
