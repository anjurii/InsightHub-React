import { getOrders } from './orderService'

describe('orderService', () => {
  it('filters orders by search and status', async () => {
    await expect(getOrders({ search: 'olivia', status: 'Completed' })).resolves.toEqual([
      expect.objectContaining({ customerName: 'Olivia Martin', status: 'Completed' }),
    ])
  })
})
