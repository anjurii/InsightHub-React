import orderFixture from '../mocks/data/orders.json'
import type { Order, OrderStatus } from '../types'
import { z } from 'zod'

const orderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  product: z.string(),
  amount: z.number(),
  status: z.enum(['Completed', 'Processing', 'Refunded']),
  createdAt: z.string().datetime(),
})

const orders: Order[] = orderSchema.array().parse(orderFixture)

const waitForMockApi = () => new Promise((resolve) => window.setTimeout(resolve, 250))

export async function getOrders(params: { search?: string; status?: OrderStatus | 'All' } = {}): Promise<Order[]> {
  await waitForMockApi()
  const normalized = params.search?.trim().toLowerCase() ?? ''
  return orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customerName} ${order.product}`.toLowerCase().includes(normalized)
    const matchesStatus = !params.status || params.status === 'All' || order.status === params.status
    return matchesSearch && matchesStatus
  })
}
