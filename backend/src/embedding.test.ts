import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createEmbedding } from './embedding'

const environmentKeys = [
  'EMBEDDING_PROVIDER',
  'OLLAMA_BASE_URL',
  'OLLAMA_EMBEDDING_MODEL',
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'OPENAI_EMBEDDING_MODEL',
] as const

const originalEnvironment = Object.fromEntries(
  environmentKeys.map((key) => [key, process.env[key]]),
)
const originalFetch = globalThis.fetch

function mockFetch(payload: unknown): jest.MockedFunction<typeof fetch> {
  const fetch = jest.fn<typeof globalThis.fetch>().mockResolvedValue({
    ok: true,
    json: async () => payload,
  } as Response)
  globalThis.fetch = fetch
  return fetch
}

afterEach(() => {
  jest.restoreAllMocks()
  if (originalFetch) globalThis.fetch = originalFetch
  else Reflect.deleteProperty(globalThis, 'fetch')
  for (const key of environmentKeys) {
    const value = originalEnvironment[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

describe('createEmbedding', () => {
  it('uses the local Ollama embedding endpoint without an API key', async () => {
    process.env.EMBEDDING_PROVIDER = 'ollama'
    process.env.OLLAMA_BASE_URL = 'http://localhost:11434/'
    process.env.OLLAMA_EMBEDDING_MODEL = 'nomic-embed-text'
    delete process.env.OPENAI_API_KEY
    const fetch = mockFetch({ embeddings: [[0.1, 0.2, 0.3]] })

    await expect(createEmbedding('refund policy')).resolves.toEqual([0.1, 0.2, 0.3])
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/embed',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ model: 'nomic-embed-text', input: 'refund policy' }),
      }),
    )
  })

  it('continues to support OpenAI-compatible embedding endpoints', async () => {
    process.env.EMBEDDING_PROVIDER = 'openai'
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.OPENAI_BASE_URL = 'https://example.test/v1/'
    process.env.OPENAI_EMBEDDING_MODEL = 'test-model'
    const fetch = mockFetch({ data: [{ embedding: [0.4, 0.5] }] })

    await expect(createEmbedding('refund policy')).resolves.toEqual([0.4, 0.5])
    expect(fetch).toHaveBeenCalledWith(
      'https://example.test/v1/embeddings',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        },
      }),
    )
  })

  it('rejects unsupported embedding providers', async () => {
    process.env.EMBEDDING_PROVIDER = 'unsupported'

    await expect(createEmbedding('refund policy')).rejects.toThrow(
      'Unsupported embedding provider: unsupported',
    )
  })
})
