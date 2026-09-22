import { createCustomer, getCustomers } from './customerService'

describe('customerService', () => {
  it('filters customers by name, email, or company', async () => {
    await expect(getCustomers('vertex')).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Jackson Lee' })]))
  })

  it('creates a customer with a stable demo shape', async () => {
    const customer = await createCustomer({ name: 'Test Customer', email: 'test@customer.com', company: 'Test Co', status: 'Active' })
    expect(customer).toMatchObject({ name: 'Test Customer', email: 'test@customer.com', initials: 'TC', spend: '$0' })
  })
})
