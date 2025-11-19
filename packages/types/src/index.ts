// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  user_id: string
  created_at: string
  updated_at: string
}

// Service Types
export interface Service {
  id: string
  name: string
  description: string
  price: number
  category: string
  user_id: string
  created_at: string
  updated_at: string
}

// Quote Types
export interface Quote {
  id: string
  client_id: string
  description: string
  total_value: number
  status: 'pending' | 'approved' | 'rejected'
  items: QuoteItem[]
  created_at: string
  updated_at: string
}

export interface QuoteItem {
  id: string
  quote_id: string
  product: Product
  quantity: number
  unitPrice: number
}

// Client Types
export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  user_id: string
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T
  error: string | null
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
  keepConnected: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Context Types
export interface UserContextType {
  user: User | null
  loading: boolean
}

// Hook Types
export interface UseApiReturn<T = any> {
  execute: (...args: any[]) => Promise<T>
  loading: boolean
  error: Error | null
}