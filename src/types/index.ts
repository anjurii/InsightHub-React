export type UserRole = 'admin' | 'analyst'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type CustomerStatus = 'Active' | 'Inactive' | 'Pending'

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  spend: string
  status: CustomerStatus
  date: string
  initials: string
  color: string
}
