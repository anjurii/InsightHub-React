import { z } from 'zod/v3'

const embeddingResponseSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()) })).min(1),
})

export const embeddingDimensions = 1536

export async function createEmbedding(input: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for document embedding')
  }

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

  const payload = embeddingResponseSchema.parse(await response.json())
  const embedding = payload.data[0].embedding
  if (embedding.length !== embeddingDimensions) {
    throw new Error(`Expected ${embeddingDimensions} embedding dimensions; received ${embedding.length}`)
  }
  return embedding
}
