import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomer, getCustomer, getCustomers, updateCustomer, type CustomerInput } from '../services/customerService'
import type { CustomerStatus } from '../types'

export function useCustomers(search: string, status: CustomerStatus | 'All', sortOrder: 'asc' | 'desc') {
  return useQuery({
    queryKey: ['customers', { search, status, sortOrder }],
    queryFn: () => getCustomers({ search, status, sortOrder }),
  })
}

export function useCustomer(id: string) {
  return useQuery({ queryKey: ['customers', id], queryFn: () => getCustomer(id), enabled: Boolean(id) })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (input: CustomerInput) => createCustomer(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }) })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: CustomerInput }) => updateCustomer(id, input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }) })
}
