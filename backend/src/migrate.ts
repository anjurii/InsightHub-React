import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { getPool, closePool } from './db.js'

try {
  const schemaPath = fileURLToPath(new URL('../sql/schema.sql', import.meta.url))
  const schema = await readFile(schemaPath, 'utf8')
  await getPool().query(schema)
  console.info('InsightHub database schema is ready.')
} catch (error) {
  console.error('Database migration failed:', error)
  process.exitCode = 1
} finally {
  await closePool()
}
