import { readdir, readFile } from 'node:fs/promises'
import { basename, relative, resolve } from 'node:path'
import { createEmbedding, embeddingDimensions } from './embedding.js'
import { closePool, getPool, getWorkspaceId } from './db.js'
import { chunkText } from './rag/chunk.js'

async function listDocuments(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return listDocuments(path)
    return entry.isFile() && /\.(md|txt)$/i.test(entry.name) ? [path] : []
  }))
  return paths.flat().sort()
}

async function ingestDirectory(directory: string): Promise<number> {
  const files = await listDocuments(directory)
  if (files.length === 0) throw new Error(`No Markdown or text documents found in ${directory}`)

  const pool = getPool()
  const workspaceId = getWorkspaceId()
  let indexedChunks = 0

  for (const file of files) {
    const content = await readFile(file, 'utf8')
    const chunks = chunkText(content)
    const documentId = relative(directory, file).replaceAll('\\', '/')
    const title = basename(file).replace(/\.(md|txt)$/i, '')
    const indexed = await Promise.all(chunks.map(async (chunk) => ({
      chunk,
      embedding: await createEmbedding(chunk),
    })))
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(
        'DELETE FROM knowledge_chunks WHERE workspace_id = $1 AND document_id = $2',
        [workspaceId, documentId],
      )
      for (const [index, item] of indexed.entries()) {
        if (item.embedding.length !== embeddingDimensions) {
          throw new Error(`Invalid embedding dimensions for ${documentId} chunk ${index}`)
        }
        await client.query(
          `INSERT INTO knowledge_chunks
             (workspace_id, document_id, chunk_index, title, content, source, embedding)
           VALUES ($1, $2, $3, $4, $5, $6, $7::vector)`,
          [workspaceId, documentId, index, title, item.chunk, documentId, `[${item.embedding.join(',')}]`],
        )
        indexedChunks += 1
      }
      await client.query('COMMIT')
      console.info(`Indexed ${chunks.length} chunks from ${documentId}`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
  return indexedChunks
}

const directory = process.argv[2]
if (!directory) {
  console.error('Usage: npm run rag:ingest -- <directory-containing-.md-or-.txt-files>')
  process.exitCode = 1
} else {
  try {
    const count = await ingestDirectory(resolve(directory))
    console.info(`Indexed ${count} knowledge chunks.`)
  } catch (error) {
    console.error('Document ingestion failed:', error)
    process.exitCode = 1
  } finally {
    await closePool()
  }
}
