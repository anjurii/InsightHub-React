import dashboardFixture from '../mocks/data/dashboard.json'
import workspaceFixture from '../mocks/data/workspace.json'
import type { DashboardData, Workspace } from '../types'
import { z } from 'zod'

const waitForMockApi = () => new Promise((resolve) => window.setTimeout(resolve, 250))

const metricSchema = z.object({
  title: z.string(),
  value: z.string(),
  change: z.string(),
  trend: z.enum(['up', 'down']),
  icon: z.enum(['revenue', 'customers', 'orders', 'conversion']),
  color: z.string(),
})

const dashboardSchema = z.object({
  metrics: metricSchema.array(),
  analyticsMetrics: metricSchema.array(),
  revenue: z.object({ name: z.string(), revenue: z.number(), orders: z.number() }).array(),
  acquisition: z.object({ name: z.string(), value: z.number(), color: z.string() }).array(),
  customerCount: z.string(),
  sources: z.object({ label: z.string(), value: z.string(), color: z.string() }).array(),
  orderStats: z.object({
    label: z.string(),
    value: z.string(),
    change: z.string(),
    filter: z.enum(['All', 'Completed', 'Processing', 'Refunded']),
    icon: z.enum(['orders', 'processing', 'completed', 'refunded']),
    color: z.string(),
  }).array(),
  activities: z.object({ initials: z.string(), color: z.string(), title: z.string(), detail: z.string(), time: z.string() }).array(),
  analyticsInsight: z.object({ revenueGrowth: z.string(), strongestProduct: z.string(), contribution: z.string() }),
})

const workspaceSchema = z.object({ id: z.string(), name: z.string(), plan: z.string() })

export async function getDashboardSummary(): Promise<DashboardData> {
  await waitForMockApi()
  return dashboardSchema.parse(dashboardFixture)
}

export async function getWorkspace(): Promise<Workspace> {
  await waitForMockApi()
  return workspaceSchema.parse(workspaceFixture)
}
