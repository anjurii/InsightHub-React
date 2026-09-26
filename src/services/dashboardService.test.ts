import { getDashboardSummary, getWorkspace } from './dashboardService'

describe('dashboardService', () => {
  it('returns dashboard metrics from the validated fixture', async () => {
    const dashboard = await getDashboardSummary()
    expect(dashboard.metrics).toHaveLength(4)
    expect(dashboard.revenue[0]).toMatchObject({ name: 'Jan', revenue: 32000 })
    expect(dashboard.activities).toHaveLength(3)
  })

  it('returns the workspace fixture through the service', async () => {
    await expect(getWorkspace()).resolves.toMatchObject({ name: 'Acme workspace', plan: 'Pro plan' })
  })
})
