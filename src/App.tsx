import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from './features/dashboard/DashboardPage'
import LoginPage from './features/auth/LoginPage'
import CustomerFormPage from './features/customers/CustomerFormPage'
import ProtectedRoute from './app/ProtectedRoute'
import { getSession } from './services/authService'
import { useAuthStore } from './store/authStore'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })

function AppRoutes() {
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    getSession().then(setUser).finally(() => setCheckingSession(false))
  }, [setUser])

  if (checkingSession) return <div className="app-loading">Loading your workspace...</div>
  return <Routes><Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} /><Route element={<ProtectedRoute />}><Route path="/customers/new" element={<CustomerFormPage />} /><Route path="/*" element={<DashboardPage />} /></Route><Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} /></Routes>
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AppRoutes /></QueryClientProvider>
}
