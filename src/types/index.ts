export type UserRole = 'admin' | 'analyst'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type Workspace = {
  id: string
  name: string
  plan: string
}

export type CustomerStatus = 'Active' | 'Inactive' | 'Pending'

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  totalSpend: number
  status: CustomerStatus
  createdAt: string
}

export type OrderStatus = 'Completed' | 'Processing' | 'Refunded'

export type Order = {
  id: string
  customerName: string
  product: string
  amount: number
  status: OrderStatus
  createdAt: string
}

export type DashboardMetric = {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: 'revenue' | 'customers' | 'orders' | 'conversion'
  color: string
}

export type DashboardData = {
  metrics: DashboardMetric[]
  analyticsMetrics: DashboardMetric[]
  revenue: { name: string; revenue: number; orders: number }[]
  acquisition: { name: string; value: number; color: string }[]
  customerCount: string
  sources: { label: string; value: string; color: string }[]
  orderStats: { label: string; value: string; change: string; filter: OrderStatus | 'All'; icon: 'orders' | 'processing' | 'completed' | 'refunded'; color: string }[]
  activities: { initials: string; color: string; title: string; detail: string; time: string }[]
  analyticsInsight: { revenueGrowth: string; strongestProduct: string; contribution: string }
}
