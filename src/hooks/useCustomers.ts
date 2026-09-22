import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomer, getCustomers, updateCustomer, type CustomerInput } from '../services/customerService'

export function useCustomers(search: string) {
  return useQuery({ queryKey: ['customers', search], queryFn: () => getCustomers(search) })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (input: CustomerInput) => createCustomer(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }) })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: CustomerInput }) => updateCustomer(id, input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }) })
}
