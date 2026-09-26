import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary, getWorkspace } from '../services/dashboardService'

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: getDashboardSummary })
}

export function useWorkspace() {
  return useQuery({ queryKey: ['workspace', 'current'], queryFn: getWorkspace })
}
