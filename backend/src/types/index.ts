import { Request } from 'express';
import { User } from '@prisma/client';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  keepConnected?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// User Types
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
}

// Product Types
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock?: number;
  minStock?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  minStock?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  active?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  active?: boolean;
}

// Service Types
export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  duration?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  duration?: number;
  active?: boolean;
}

export interface ServiceFilters {
  search?: string;
  category?: string;
  active?: boolean;
}

// Client Types
export interface CreateClientRequest {
  personType: 'FISICA' | 'JURIDICA';
  name: string;
  tradingName?: string;
  document: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  contactName?: string;
  contactRole?: string;
  category?: 'POTENTIAL' | 'REGULAR' | 'VIP';
  notes?: string;
}

export interface UpdateClientRequest {
  personType?: 'FISICA' | 'JURIDICA';
  name?: string;
  tradingName?: string;
  document?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  contactName?: string;
  contactRole?: string;
  category?: 'POTENTIAL' | 'REGULAR' | 'VIP';
  notes?: string;
  active?: boolean;
}

export interface ClientFilters {
  search?: string;
  category?: string;
  personType?: string;
  active?: boolean;
}

// Quote Types
export interface CreateQuoteRequest {
  clientId: string;
  description: string;
  items: QuoteItemRequest[];
  serviceItems?: ServiceItemRequest[];
  profitPercentage?: number;
  tags?: string[];
  notes?: string;
  validUntil?: string;
  terms?: string;
}

export interface UpdateQuoteRequest {
  clientId?: string;
  description?: string;
  profitPercentage?: number;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  tags?: string[];
  notes?: string;
  validUntil?: string;
  terms?: string;
}

export interface QuoteItemRequest {
  productId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface ServiceItemRequest {
  serviceId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface QuoteFilters {
  search?: string;
  status?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Service Order Types
export interface CreateServiceOrderRequest {
  quoteId: string;
  clientId: string;
  responsibleId: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  startDate?: string;
  notes?: string;
  tags?: string[];
  estimatedHours?: number;
}

export interface UpdateServiceOrderRequest {
  responsibleId?: string;
  status?: 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED' | 'DELIVERED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface ServiceOrderFilters {
  search?: string;
  status?: string;
  clientId?: string;
  responsibleId?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Transaction Types
export interface CreateTransactionRequest {
  type: 'INCOME' | 'EXPENSE';
  value: number;
  description: string;
  paymentMethod: 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PIX' | 'BOLETO' | 'CHECK';
  category: string;
  date: string;
  dueDate?: string;
  notes?: string;
  tags?: string[];
  referenceId?: string;
}

export interface UpdateTransactionRequest {
  type?: 'INCOME' | 'EXPENSE';
  value?: number;
  description?: string;
  paymentMethod?: 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PIX' | 'BOLETO' | 'CHECK';
  category?: string;
  date?: string;
  dueDate?: string;
  paidAt?: string;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  tags?: string[];
  referenceId?: string;
}

export interface TransactionFilters {
  search?: string;
  type?: string;
  category?: string;
  paymentMethod?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Settings Types
export interface UpdateSettingsRequest {
  companyName?: string;
  companyDocument?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyLogo?: string;
  notificationSettings?: any;
  systemSettings?: any;
  quoteSettings?: any;
  invoiceSettings?: any;
}

// Dashboard Types
export interface DashboardStats {
  totalQuotes: number;
  totalClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingQuotes: number;
  activeServiceOrders: number;
  lowStockProducts: number;
  overdueTransactions: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Audit Types
export interface AuditLogRequest {
  action: string;
  module: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
}

// File Upload Types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// External API Types
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
  cpfCnpj: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  city: string;
  state: string;
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  date_created: string;
  date_approved: string;
  description: string;
  external_reference: string;
}