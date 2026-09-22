import type { Customer, CustomerStatus } from '../types'

const seedCustomers: Customer[] = [
  { id: 'cus-1', name: 'Olivia Martin', email: 'olivia.martin@gmail.com', company: 'Luminary Labs', spend: '$24,890', status: 'Active', date: 'Sep 24, 2024', initials: 'OM', color: 'lavender' },
  { id: 'cus-2', name: 'Jackson Lee', email: 'jackson.lee@vertex.io', company: 'Vertex Systems', spend: '$18,420', status: 'Active', date: 'Sep 21, 2024', initials: 'JL', color: 'blue' },
  { id: 'cus-3', name: 'Sofia Davis', email: 'sofia.davis@orbit.co', company: 'Orbit Commerce', spend: '$15,780', status: 'Pending', date: 'Sep 18, 2024', initials: 'SD', color: 'peach' },
  { id: 'cus-4', name: 'Liam Wilson', email: 'liam.wilson@acme.com', company: 'Acme Inc.', spend: '$12,350', status: 'Active', date: 'Sep 17, 2024', initials: 'LW', color: 'mint' },
  { id: 'cus-5', name: 'Ava Thompson', email: 'ava.thompson@northstar.ai', company: 'Northstar AI', spend: '$9,840', status: 'Inactive', date: 'Sep 15, 2024', initials: 'AT', color: 'rose' },
]

let customers = [...seedCustomers]

export type CustomerInput = Pick<Customer, 'name' | 'email' | 'company'> & { status: CustomerStatus }

export async function getCustomers(search = '') {
  await new Promise((resolve) => window.setTimeout(resolve, 250))
  const normalized = search.toLowerCase()
  return customers.filter((customer) => `${customer.name} ${customer.email} ${customer.company}`.toLowerCase().includes(normalized))
}

export async function createCustomer(input: CustomerInput) {
  await new Promise((resolve) => window.setTimeout(resolve, 250))
  const initials = input.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const customer: Customer = { ...input, id: `cus-${Date.now()}`, spend: '$0', date: 'Today', initials, color: 'lavender' }
  customers = [customer, ...customers]
  return customer
}

export async function updateCustomer(id: string, input: CustomerInput) {
  await new Promise((resolve) => window.setTimeout(resolve, 250))
  customers = customers.map((customer) => customer.id === id ? { ...customer, ...input } : customer)
  return customers.find((customer) => customer.id === id) ?? null
}
