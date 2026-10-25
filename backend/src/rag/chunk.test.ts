import { chunkText } from './chunk'
import { describe, expect, it } from '@jest/globals'

describe('chunkText', () => {
  it('returns no chunks for blank input', () => {
    expect(chunkText(' \n  ')).toEqual([])
  })

  it('keeps short documents together and normalizes line endings', () => {
    expect(chunkText('first\r\nsecond')).toEqual(['first\nsecond'])
  })

  it('splits long documents with overlapping context', () => {
    const text = 'a'.repeat(2800)
    const chunks = chunkText(text)

    expect(chunks.length).toBeGreaterThan(2)
    expect(chunks.every((chunk) => chunk.length <= 1200)).toBe(true)
    expect(chunks[0].slice(-150)).toBe(chunks[1].slice(0, 150))
  })
})
