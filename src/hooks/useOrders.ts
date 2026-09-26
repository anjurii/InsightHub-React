import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../services/orderService'
import type { OrderStatus } from '../types'

export function useOrders(search: string, status: OrderStatus | 'All') {
  return useQuery({
    queryKey: ['orders', search, status],
    queryFn: () => getOrders({ search, status }),
  })
}
