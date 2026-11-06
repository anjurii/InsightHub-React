import { z } from 'zod/v3'

const openAIResponseSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()).min(1) })).min(1),
})

const ollamaResponseSchema = z.object({
  embeddings: z.array(z.array(z.number()).min(1)).min(1),
})

export async function createEmbedding(input: string): Promise<number[]> {
  const provider = process.env.EMBEDDING_PROVIDER ?? 'openai'

  if (provider === 'ollama') {
    const baseUrl = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/+$/, '')
    const model = process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text'
    const response = await fetch(`${baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input }),
    })

    if (!response.ok) {
      throw new Error(`Ollama embedding request failed with HTTP ${response.status}`)
    }

    const payload = ollamaResponseSchema.parse(await response.json())
    return payload.embeddings[0]
  }

  if (provider !== 'openai') {
    throw new Error(`Unsupported embedding provider: ${provider}`)
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is required when EMBEDDING_PROVIDER is openai')

  const baseUrl = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small'
  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, input }),
  })

  if (!response.ok) {
    throw new Error(`Embedding request failed with HTTP ${response.status}`)
  }

  const payload = openAIResponseSchema.parse(await response.json())
  return payload.data[0].embedding
}
