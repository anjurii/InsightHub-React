import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod/v3'
import { closePool, getPool, getWorkspaceId } from './db.js'

const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string(),
  totalSpend: z.number(),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  createdAt: z.string().datetime(),
})

const orderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  product: z.string(),
  amount: z.number(),
  status: z.enum(['Completed', 'Processing', 'Refunded']),
  createdAt: z.string().datetime(),
})

async function readFixture<T>(filename: string, schema: z.ZodType<T>): Promise<T[]> {
  const contents = await readFile(resolve('src', 'mocks', 'data', filename), 'utf8')
  return schema.array().parse(JSON.parse(contents))
}

async function seed(): Promise<void> {
  const [customers, orders] = await Promise.all([
    readFixture('customers.json', customerSchema),
    readFixture('orders.json', orderSchema),
  ])
  const pool = getPool()
  const client = await pool.connect()
  const workspaceId = getWorkspaceId()

  try {
    await client.query('BEGIN')
    for (const customer of customers) {
      await client.query(
        `INSERT INTO customers (workspace_id, id, name, email, company, total_spend, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (workspace_id, id) DO UPDATE SET
           name = EXCLUDED.name, email = EXCLUDED.email, company = EXCLUDED.company,
           total_spend = EXCLUDED.total_spend, status = EXCLUDED.status, created_at = EXCLUDED.created_at`,
        [workspaceId, customer.id, customer.name, customer.email, customer.company, customer.totalSpend, customer.status, customer.createdAt],
      )
    }
    for (const order of orders) {
      await client.query(
        `INSERT INTO orders (workspace_id, id, customer_name, product, amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (workspace_id, id) DO UPDATE SET
           customer_name = EXCLUDED.customer_name, product = EXCLUDED.product,
           amount = EXCLUDED.amount, status = EXCLUDED.status, created_at = EXCLUDED.created_at`,
        [workspaceId, order.id, order.customerName, order.product, order.amount, order.status, order.createdAt],
      )
    }
    await client.query('COMMIT')
    console.info(`Seeded ${customers.length} customers and ${orders.length} orders in workspace "${workspaceId}".`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

try {
  await seed()
} catch (error) {
  console.error('Database seeding failed:', error)
  process.exitCode = 1
} finally {
  await closePool()
}
