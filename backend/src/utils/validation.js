const { z } = require('zod');

// Auth schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório')
});

// Client schemas
const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
  personType: z.enum(['FISICA', 'JURIDICA']).optional(),
  tradingName: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  contactName: z.string().optional(),
  contactRole: z.string().optional(),
  category: z.enum(['POTENTIAL', 'REGULAR', 'VIP']).optional(),
  notes: z.string().optional(),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional()
});

// Product schemas
const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  stock: z.number().int().min(0, 'Estoque deve ser maior ou igual a 0').optional(),
  minStock: z.number().int().min(0, 'Estoque mínimo deve ser maior ou igual a 0').optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.number().min(0, 'Peso deve ser maior ou igual a 0').optional(),
  dimensions: z.string().optional()
});

// Service schemas
const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  duration: z.number().int().min(1, 'Duração deve ser maior que 0').optional()
});

// Quote schemas
const quoteItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  description: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que 0'),
  unitPrice: z.number().min(0, 'Preço unitário deve ser maior ou igual a 0'),
  discount: z.number().min(0).max(100, 'Desconto deve estar entre 0 e 100').optional()
});

const serviceItemSchema = z.object({
  serviceId: z.string().uuid('ID do serviço inválido'),
  description: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que 0'),
  unitPrice: z.number().min(0, 'Preço unitário deve ser maior ou igual a 0'),
  discount: z.number().min(0).max(100, 'Desconto deve estar entre 0 e 100').optional()
});

const quoteSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  totalValue: z.number().min(0, 'Valor total deve ser maior ou igual a 0'),
  profitPercentage: z.number().min(0).max(100, 'Margem de lucro deve estar entre 0 e 100').optional(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  validUntil: z.string().datetime('Data de validade inválida').optional(),
  terms: z.string().optional(),
  items: z.array(quoteItemSchema).optional(),
  serviceItems: z.array(serviceItemSchema).optional()
});

// Transaction schemas
const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], 'Tipo deve ser INCOME ou EXPENSE'),
  value: z.number().min(0.01, 'Valor deve ser maior que 0'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  paymentMethod: z.enum(['CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'PIX', 'BOLETO', 'CHECK']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().datetime('Data inválida'),
  dueDate: z.string().datetime('Data de vencimento inválida').optional(),
  paidAt: z.string().datetime('Data de pagamento inválida').optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  referenceId: z.string().uuid('ID de referência inválido').optional()
});

// Service Order schemas
const serviceOrderSchema = z.object({
  quoteId: z.string().uuid('ID do orçamento inválido'),
  clientId: z.string().uuid('ID do cliente inválido'),
  responsibleId: z.string().uuid('ID do responsável inválido'),
  status: z.enum(['WAITING', 'IN_PROGRESS', 'PAUSED', 'FINISHED', 'DELIVERED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  deadline: z.string().datetime('Data limite inválida').optional(),
  startDate: z.string().datetime('Data de início inválida').optional(),
  endDate: z.string().datetime('Data de fim inválida').optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimatedHours: z.number().int().min(0, 'Horas estimadas deve ser maior ou igual a 0').optional(),
  actualHours: z.number().int().min(0, 'Horas reais deve ser maior ou igual a 0').optional()
});

// Settings schemas
const companySettingsSchema = z.object({
  companyName: z.string().optional(),
  companyDocument: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Email da empresa inválido').optional().or(z.literal('')),
  companyAddress: z.string().optional(),
  companyLogo: z.string().optional()
});

const systemSettingsSchema = z.object({
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional()
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  quotesNotifications: z.boolean().optional(),
  ordersNotifications: z.boolean().optional(),
  paymentsNotifications: z.boolean().optional()
});

// Query schemas
const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Página deve ser maior que 0').optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, 'Limite deve estar entre 1 e 100').optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional()
});

// ID parameter schema
const idParamSchema = z.object({
  id: z.string().uuid('ID inválido')
});

module.exports = {
  // Auth
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  
  // Client
  clientSchema,
  
  // Product
  productSchema,
  
  // Service
  serviceSchema,
  
  // Quote
  quoteSchema,
  quoteItemSchema,
  serviceItemSchema,
  
  // Transaction
  transactionSchema,
  
  // Service Order
  serviceOrderSchema,
  
  // Settings
  companySettingsSchema,
  systemSettingsSchema,
  notificationSettingsSchema,
  
  // Product schemas (from product.validator.js)
  productSchema: z.object({
    name: z.string()
      .min(1, 'Nome é obrigatório')
      .max(255, 'Nome deve ter no máximo 255 caracteres'),
    
    description: z.string()
      .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
      .optional(),
    
    sku: z.string()
      .max(50, 'SKU deve ter no máximo 50 caracteres')
      .optional()
      .nullable(),
    
    barcode: z.string()
      .max(50, 'Código de barras deve ter no máximo 50 caracteres')
      .optional()
      .nullable(),
    
    category: z.string()
      .max(100, 'Categoria deve ter no máximo 100 caracteres')
      .optional()
      .nullable(),
    
    price: z.number()
      .min(0, 'Preço deve ser maior ou igual a zero')
      .max(999999.99, 'Preço muito alto'),
    
    cost: z.number()
      .min(0, 'Custo deve ser maior ou igual a zero')
      .max(999999.99, 'Custo muito alto')
      .optional()
      .default(0),
    
    stock: z.number()
      .int('Estoque deve ser um número inteiro')
      .min(0, 'Estoque deve ser maior ou igual a zero')
      .optional()
      .default(0),
    
    min_stock: z.number()
      .int('Estoque mínimo deve ser um número inteiro')
      .min(0, 'Estoque mínimo deve ser maior ou igual a zero')
      .optional()
      .default(0),
    
    unit: z.string()
      .max(10, 'Unidade deve ter no máximo 10 caracteres')
      .optional()
      .default('UN'),
    
    active: z.boolean()
      .optional()
      .default(true)
  }),

  productUpdateSchema: z.object({
    name: z.string()
      .min(1, 'Nome é obrigatório')
      .max(255, 'Nome deve ter no máximo 255 caracteres')
      .optional(),
    
    description: z.string()
      .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
      .optional()
      .nullable(),
    
    sku: z.string()
      .max(50, 'SKU deve ter no máximo 50 caracteres')
      .optional()
      .nullable(),
    
    barcode: z.string()
      .max(50, 'Código de barras deve ter no máximo 50 caracteres')
      .optional()
      .nullable(),
    
    category: z.string()
      .max(100, 'Categoria deve ter no máximo 100 caracteres')
      .optional()
      .nullable(),
    
    price: z.number()
      .min(0, 'Preço deve ser maior ou igual a zero')
      .max(999999.99, 'Preço muito alto')
      .optional(),
    
    cost: z.number()
      .min(0, 'Custo deve ser maior ou igual a zero')
      .max(999999.99, 'Custo muito alto')
      .optional(),
    
    stock: z.number()
      .int('Estoque deve ser um número inteiro')
      .min(0, 'Estoque deve ser maior ou igual a zero')
      .optional(),
    
    min_stock: z.number()
      .int('Estoque mínimo deve ser um número inteiro')
      .min(0, 'Estoque mínimo deve ser maior ou igual a zero')
      .optional(),
    
    unit: z.string()
      .max(10, 'Unidade deve ter no máximo 10 caracteres')
      .optional(),
    
    active: z.boolean()
      .optional()
  }),

  productSearchSchema: z.object({
    page: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'Página deve ser maior que zero')
      .optional()
      .default('1'),
    
    limit: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0 && val <= 100, 'Limit deve ser entre 1 e 100')
      .optional()
      .default('10'),
    
    search: z.string()
      .max(255, 'Termo de busca muito longo')
      .optional(),
    
    category: z.string()
      .max(100, 'Categoria inválida')
      .optional(),
    
    active: z.string()
      .transform(val => val === 'true')
      .optional(),
    
    low_stock: z.string()
      .transform(val => val === 'true')
      .optional(),
    
    sort: z.enum(['name', 'category', 'price', 'stock', 'created_at'])
      .optional()
      .default('name'),
    
    order: z.enum(['ASC', 'DESC', 'asc', 'desc'])
      .optional()
      .default('ASC')
  }),

  // Service schemas
  serviceUpdateSchema: z.object({
    name: z.string()
      .min(1, 'Nome é obrigatório')
      .max(255, 'Nome deve ter no máximo 255 caracteres')
      .optional(),
    
    description: z.string()
      .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
      .optional()
      .nullable(),
    
    category: z.string()
      .max(100, 'Categoria deve ter no máximo 100 caracteres')
      .optional()
      .nullable(),
    
    price: z.number()
      .min(0, 'Preço deve ser maior ou igual a zero')
      .max(999999.99, 'Preço muito alto')
      .optional(),
    
    duration_hours: z.number()
      .min(0, 'Duração deve ser maior ou igual a zero')
      .max(999, 'Duração muito alta')
      .optional()
      .nullable(),
    
    active: z.boolean()
      .optional()
  }),

  serviceSearchSchema: z.object({
    page: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'Página deve ser maior que zero')
      .optional()
      .default('1'),
    
    limit: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0 && val <= 100, 'Limit deve ser entre 1 e 100')
      .optional()
      .default('10'),
    
    search: z.string()
      .max(255, 'Termo de busca muito longo')
      .optional(),
    
    category: z.string()
      .max(100, 'Categoria inválida')
      .optional(),
    
    active: z.string()
      .transform(val => val === 'true')
      .optional(),
    
    sort: z.enum(['name', 'category', 'price', 'duration_hours', 'created_at'])
      .optional()
      .default('name'),
    
    order: z.enum(['ASC', 'DESC', 'asc', 'desc'])
      .optional()
      .default('ASC')
  }),

  // Quote schemas
  quoteUpdateSchema: z.object({
    client_id: z.number()
      .int('ID do cliente deve ser um inteiro')
      .min(1, 'Cliente é obrigatório')
      .optional(),
    
    title: z.string()
      .min(1, 'Título é obrigatório')
      .max(255, 'Título deve ter no máximo 255 caracteres')
      .optional(),
    
    description: z.string()
      .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
      .optional()
      .nullable(),
    
    valid_until: z.string()
      .datetime('Data de validade deve ser uma data válida')
      .optional()
      .nullable(),
    
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'])
      .optional(),
    
    subtotal: z.number()
      .min(0, 'Subtotal deve ser maior ou igual a zero')
      .max(999999999.99, 'Subtotal muito alto')
      .optional(),
    
    discount_amount: z.number()
      .min(0, 'Desconto deve ser maior ou igual a zero')
      .max(999999.99, 'Desconto muito alto')
      .optional(),
    
    discount_percentage: z.number()
      .min(0, 'Percentual de desconto deve ser maior ou igual a zero')
      .max(100, 'Percentual de desconto não pode ser maior que 100%')
      .optional(),
    
    total: z.number()
      .min(0, 'Total deve ser maior ou igual a zero')
      .max(999999999.99, 'Total muito alto')
      .optional(),
    
    notes: z.string()
      .max(1000, 'Observações devem ter no máximo 1000 caracteres')
      .optional()
      .nullable(),
    
    items: z.array(quoteItemSchema)
      .optional()
  }),

  quoteSearchSchema: z.object({
    page: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'Página deve ser maior que zero')
      .optional()
      .default('1'),
    
    limit: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0 && val <= 100, 'Limit deve ser entre 1 e 100')
      .optional()
      .default('10'),
    
    search: z.string()
      .max(255, 'Termo de busca muito longo')
      .optional(),
    
    client_id: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'ID do cliente deve ser um número positivo')
      .optional(),
    
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'])
      .optional(),
    
    valid_from: z.string()
      .datetime('Data inicial deve ser uma data válida')
      .optional(),
    
    valid_to: z.string()
      .datetime('Data final deve ser uma data válida')
      .optional(),
    
    sort: z.enum(['title', 'status', 'total', 'valid_until', 'created_at'])
      .optional()
      .default('created_at'),
    
    order: z.enum(['ASC', 'DESC', 'asc', 'desc'])
      .optional()
      .default('DESC')
  }),

  // User schemas
  userCreateSchema: z.object({
    name: z.string()
      .min(1, 'Nome é obrigatório')
      .max(255, 'Nome deve ter no máximo 255 caracteres'),
    
    email: z.string()
      .email('Email inválido')
      .max(255, 'Email deve ter no máximo 255 caracteres'),
    
    password: z.string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    
    role: z.enum(['user', 'admin'])
      .optional()
      .default('user'),
    
    active: z.boolean()
      .optional()
      .default(true)
  }),

  userUpdateSchema: z.object({
    name: z.string()
      .min(1, 'Nome é obrigatório')
      .max(255, 'Nome deve ter no máximo 255 caracteres')
      .optional(),
    
    email: z.string()
      .email('Email inválido')
      .max(255, 'Email deve ter no máximo 255 caracteres')
      .optional(),
    
    role: z.enum(['user', 'admin'])
      .optional(),
    
    active: z.boolean()
      .optional(),
    
    email_verified: z.boolean()
      .optional()
  }),

  userSearchSchema: z.object({
    page: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'Página deve ser maior que zero')
      .optional()
      .default('1'),
    
    limit: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0 && val <= 100, 'Limit deve ser entre 1 e 100')
      .optional()
      .default('10'),
    
    search: z.string()
      .max(255, 'Termo de busca muito longo')
      .optional(),
    
    role: z.enum(['user', 'admin'])
      .optional(),
    
    active: z.string()
      .transform(val => val === 'true')
      .optional(),
    
    sort: z.enum(['name', 'email', 'role', 'created_at'])
      .optional()
      .default('name'),
    
    order: z.enum(['ASC', 'DESC', 'asc', 'desc'])
      .optional()
      .default('ASC')
  }),

  passwordChangeSchema: z.object({
    current_password: z.string()
      .min(1, 'Senha atual é obrigatória')
      .optional(), // Opcional para admins
    
    new_password: z.string()
      .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
      .max(128, 'Nova senha deve ter no máximo 128 caracteres')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
  }),

  // Transaction schemas
  transactionUpdateSchema: z.object({
    type: z.enum(['INCOME', 'EXPENSE'])
      .optional(),
    
    category: z.string()
      .max(100, 'Categoria deve ter no máximo 100 caracteres')
      .optional()
      .nullable(),
    
    description: z.string()
      .min(1, 'Descrição é obrigatória')
      .max(255, 'Descrição deve ter no máximo 255 caracteres')
      .optional(),
    
    amount: z.number()
      .positive('Valor deve ser maior que zero')
      .max(999999999.99, 'Valor muito alto')
      .optional(),
    
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
      .optional(),
    
    client_id: z.number()
      .int('ID do cliente deve ser um inteiro')
      .positive('ID do cliente deve ser positivo')
      .optional()
      .nullable(),
    
    quote_id: z.number()
      .int('ID do orçamento deve ser um inteiro')
      .positive('ID do orçamento deve ser positivo')
      .optional()
      .nullable(),
    
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
      .optional(),
    
    payment_method: z.string()
      .max(50, 'Método de pagamento deve ter no máximo 50 caracteres')
      .optional()
      .nullable(),
    
    reference: z.string()
      .max(100, 'Referência deve ter no máximo 100 caracteres')
      .optional()
      .nullable(),
    
    notes: z.string()
      .max(1000, 'Observações devem ter no máximo 1000 caracteres')
      .optional()
      .nullable()
  }),

  transactionSearchSchema: z.object({
    page: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'Página deve ser maior que zero')
      .optional()
      .default('1'),
    
    limit: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0 && val <= 100, 'Limit deve ser entre 1 e 100')
      .optional()
      .default('10'),
    
    search: z.string()
      .max(255, 'Termo de busca muito longo')
      .optional(),
    
    type: z.enum(['INCOME', 'EXPENSE'])
      .optional(),
    
    category: z.string()
      .max(100, 'Categoria inválida')
      .optional(),
    
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
      .optional(),
    
    client_id: z.string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'ID do cliente deve ser um número positivo')
      .optional(),
    
    date_from: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial deve estar no formato YYYY-MM-DD')
      .optional(),
    
    date_to: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final deve estar no formato YYYY-MM-DD')
      .optional(),
    
    amount_min: z.string()
      .transform(val => parseFloat(val))
      .refine(val => val >= 0, 'Valor mínimo deve ser maior ou igual a zero')
      .optional(),
    
    amount_max: z.string()
      .transform(val => parseFloat(val))
      .refine(val => val > 0, 'Valor máximo deve ser maior que zero')
      .optional(),
    
    sort: z.enum(['date', 'amount', 'type', 'status', 'created_at'])
      .optional()
      .default('date'),
    
    order: z.enum(['ASC', 'DESC', 'asc', 'desc'])
      .optional()
      .default('DESC')
  }),

  // Utilities
  paginationSchema,
  idParamSchema
};