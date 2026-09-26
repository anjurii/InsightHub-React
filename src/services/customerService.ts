import customerFixture from '../mocks/data/customers.json'
import type { Customer, CustomerStatus } from '../types'
import { z } from 'zod'

const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string(),
  totalSpend: z.number(),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  createdAt: z.string().datetime(),
})

let customers: Customer[] = customerSchema.array().parse(customerFixture)

export type CustomerInput = Pick<Customer, 'name' | 'email' | 'company'> & { status: CustomerStatus }

const waitForMockApi = () => new Promise((resolve) => window.setTimeout(resolve, 250))

export async function getCustomers(params: { search?: string; status?: CustomerStatus | 'All'; sortOrder?: 'asc' | 'desc' } = {}): Promise<Customer[]> {
  await waitForMockApi()
  const normalized = params.search?.trim().toLowerCase() ?? ''
  return customers
    .filter((customer) => `${customer.name} ${customer.email} ${customer.company}`.toLowerCase().includes(normalized))
    .filter((customer) => !params.status || params.status === 'All' || customer.status === params.status)
    .sort((a, b) => params.sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name))
}

export async function getCustomer(id: string): Promise<Customer> {
  await waitForMockApi()
  const customer = customers.find((item) => item.id === id)
  if (!customer) throw new Error(`Customer ${id} was not found`)
  return customer
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  await waitForMockApi()
  if (customers.some((customer) => customer.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('A customer with this email already exists')
  }
  const customer: Customer = {
    ...input,
    id: `cus-${Date.now()}`,
    totalSpend: 0,
    createdAt: new Date().toISOString(),
  }
  customers = [customer, ...customers]
  return customer
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  await waitForMockApi()
  const index = customers.findIndex((customer) => customer.id === id)
  if (index < 0) throw new Error(`Customer ${id} was not found`)
  const updatedCustomer = { ...customers[index], ...input }
  customers = customers.map((customer) => customer.id === id ? updatedCustomer : customer)
  return updatedCustomer
}
