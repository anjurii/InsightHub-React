import { createEmbedding } from '../embedding.js'
import { getPool, getWorkspaceId } from '../db.js'

export type KnowledgeMatch = {
  title: string
  source: string
  content: string
  similarity: number
}

export async function searchKnowledge(query: string, limit: number): Promise<KnowledgeMatch[]> {
  const embedding = await createEmbedding(query)
  const vector = `[${embedding.join(',')}]`
  const result = await getPool().query<KnowledgeMatch>(
    `SELECT title, source, content, 1 - (embedding <=> $1::vector) AS similarity
     FROM knowledge_chunks
     WHERE workspace_id = $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [vector, getWorkspaceId(), limit],
  )
  return result.rows
}
