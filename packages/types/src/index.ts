export type UserRole = "ADMIN" | "MANAGER" | "USER"
export type ClientType = "INDIVIDUAL" | "BUSINESS"
export type ClientCategory = "POTENTIAL" | "REGULAR" | "VIP"
export type QuoteStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"
export type ServiceOrderStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type ServiceOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type TransactionType = "INCOME" | "EXPENSE"
export type TransactionStatus = "PENDING" | "PAID" | "CANCELLED"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
  emailVerified: boolean
  phone?: string | null
  avatar?: string | null
  lastLogin?: string | null
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  type: ClientType
  name: string
  tradeName?: string | null
  email?: string | null
  phone?: string | null
  mobile?: string | null
  document?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  category: ClientCategory
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  code?: string | null
  name: string
  description?: string | null
  category?: string | null
  unit: string
  costPrice: number | string
  salePrice: number | string
  stock: number
  minStock: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  code?: string | null
  name: string
  description?: string | null
  category?: string | null
  unit: string
  costPrice: number | string
  salePrice: number | string
  estimatedDuration?: number | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number | string
  totalPrice: number | string
  productId?: string | null
  serviceId?: string | null
}

export interface Quote {
  id: string
  quoteNumber: string
  clientId: string
  description?: string | null
  subtotal: number | string
  discount: number | string
  tax: number | string
  totalValue: number | string
  validUntil?: string | null
  status: QuoteStatus
  publicToken?: string | null
  publicLinkEnabled: boolean
  createdAt: string
  updatedAt: string
  items?: QuoteItem[]
}

export interface ServiceOrder {
  id: string
  orderNumber: string
  clientId: string
  quoteId?: string | null
  description: string
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  startDate?: string | null
  estimatedEndDate?: string | null
  actualEndDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number | string
  description: string
  date: string
  paymentMethod?: string | null
  status: TransactionStatus
  dueDate?: string | null
  paidAt?: string | null
  documentNumber?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
  status?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: ApiError | null
}

export interface PaginatedResponse<T> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  data?: T[]
}
