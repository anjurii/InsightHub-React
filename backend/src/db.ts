import 'dotenv/config'
import { Pool } from 'pg'

let pool: Pool | undefined

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to connect to PostgreSQL')
  }
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL })
  return pool
}

export function getWorkspaceId(): string {
  const workspaceId = process.env.INSIGHTHUB_WORKSPACE_ID?.trim()
  if (!workspaceId) {
    throw new Error('INSIGHTHUB_WORKSPACE_ID must identify the workspace this server may access')
  }
  return workspaceId
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}
