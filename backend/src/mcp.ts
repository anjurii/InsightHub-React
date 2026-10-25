import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod/v3'
import { closePool, getPool, getWorkspaceId } from './db.js'
import { searchKnowledge } from './rag/retrieve.js'

const server = new McpServer({
  name: 'insighthub',
  version: '0.1.0',
})

server.registerTool(
  'search_customers',
  {
    description: 'Search customers in the configured InsightHub workspace.',
    inputSchema: {
      query: z.string().trim().max(200).optional(),
      status: z.enum(['Active', 'Inactive', 'Pending']).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
  },
  async ({ query, status, limit }) => {
    const result = await getPool().query(
      `SELECT id, name, email, company, total_spend AS "totalSpend", status,
              created_at AS "createdAt"
       FROM customers
       WHERE workspace_id = $1
         AND ($2::text IS NULL OR status = $2)
         AND ($3::text IS NULL OR strpos(lower(concat_ws(' ', name, email, company)), lower($3)) > 0)
       ORDER BY name
       LIMIT $4`,
      [getWorkspaceId(), status ?? null, query || null, limit ?? 10],
    )
    return { content: [{ type: 'text', text: JSON.stringify(result.rows) }] }
  },
)

server.registerTool(
  'list_orders',
  {
    description: 'List recent orders in the configured InsightHub workspace, optionally filtered by status.',
    inputSchema: {
      status: z.enum(['Completed', 'Processing', 'Refunded']).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
  },
  async ({ status, limit }) => {
    const result = await getPool().query(
      `SELECT id, customer_name AS "customerName", product, amount, status,
              created_at AS "createdAt"
       FROM orders
       WHERE workspace_id = $1 AND ($2::text IS NULL OR status = $2)
       ORDER BY created_at DESC
       LIMIT $3`,
      [getWorkspaceId(), status ?? null, limit ?? 10],
    )
    return { content: [{ type: 'text', text: JSON.stringify(result.rows) }] }
  },
)

server.registerTool(
  'search_knowledge_base',
  {
    description: 'Retrieve relevant document passages from the configured workspace for grounded answers.',
    inputSchema: {
      query: z.string().trim().min(1).max(2000),
      limit: z.number().int().min(1).max(10).optional(),
    },
  },
  async ({ query, limit }) => {
    const matches = await searchKnowledge(query, limit ?? 5)
    return { content: [{ type: 'text', text: JSON.stringify(matches) }] }
  },
)

const transport = new StdioServerTransport()
try {
  await server.connect(transport)
} catch (error) {
  console.error('Unable to start the InsightHub MCP server:', error)
  await closePool()
  process.exitCode = 1
}

process.on('SIGINT', () => {
  void server.close().then(closePool).catch((error: unknown) => {
    console.error('Failed to close the MCP server cleanly:', error)
    process.exitCode = 1
  })
})

process.on('SIGTERM', () => {
  void server.close().then(closePool).catch((error: unknown) => {
    console.error('Failed to close the MCP server cleanly:', error)
    process.exitCode = 1
  })
})
