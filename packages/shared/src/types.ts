// Shared types from Prisma
export type {
  User,
  Product,
  Service,
  Client,
  Quote,
  QuoteItem,
  ServiceItem,
  ServiceOrder,
  Transaction,
  Setting,
  AuditLog,
  RefreshToken,
  Role,
  Plan,
  PersonType,
  ClientCategory,
  QuoteStatus,
  ServiceOrderStatus,
  Priority,
  TransactionType,
  PaymentMethod,
  TransactionStatus,
} from "@metalgest/database";

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER" | "FINANCEIRO" | "COMERCIAL" | "PRODUCAO";
  plan: "FREE" | "PREMIUM" | "ENTERPRISE";
  active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Dashboard types
export interface DashboardStats {
  totalQuotes: number;
  totalClients: number;
  totalProducts: number;
  totalServices: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  pendingQuotes: number;
  activeServiceOrders: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Filter types
export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductFilters extends BaseFilters {
  category?: string;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ServiceFilters extends BaseFilters {
  category?: string;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ClientFilters extends BaseFilters {
  personType?: "FISICA" | "JURIDICA";
  category?: "POTENTIAL" | "REGULAR" | "VIP";
  active?: boolean;
  city?: string;
  state?: string;
}

export interface QuoteFilters extends BaseFilters {
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  clientId?: string;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionFilters extends BaseFilters {
  type?: "INCOME" | "EXPENSE";
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
  paymentMethod?: "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "BANK_TRANSFER" | "PIX" | "BOLETO" | "CHECK";
  category?: string;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
}