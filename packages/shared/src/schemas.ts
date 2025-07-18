import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço deve ser maior que 0"),
  category: z.string().min(1, "Categoria é obrigatória"),
  stock: z.number().min(0, "Estoque não pode ser negativo").default(0),
  minStock: z.number().min(0, "Estoque mínimo não pode ser negativo").default(0),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.number().min(0, "Peso não pode ser negativo").optional(),
  dimensions: z.string().optional(),
  active: z.boolean().default(true),
});

// Service schemas
export const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço deve ser maior que 0"),
  category: z.string().min(1, "Categoria é obrigatória"),
  duration: z.number().min(0, "Duração não pode ser negativa").optional(),
  active: z.boolean().default(true),
});

// Client schemas
export const clientSchema = z.object({
  personType: z.enum(["FISICA", "JURIDICA"]).default("FISICA"),
  name: z.string().min(1, "Nome é obrigatório"),
  tradingName: z.string().optional(),
  document: z.string().min(1, "Documento é obrigatório"),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  contactName: z.string().optional(),
  contactRole: z.string().optional(),
  category: z.enum(["POTENTIAL", "REGULAR", "VIP"]).default("REGULAR"),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

// Quote schemas
export const quoteItemSchema = z.object({
  productId: z.string(),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unitPrice: z.number().min(0, "Preço unitário não pode ser negativo"),
  discount: z.number().min(0, "Desconto não pode ser negativo").max(100, "Desconto não pode ser maior que 100%").default(0),
});

export const serviceItemSchema = z.object({
  serviceId: z.string(),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unitPrice: z.number().min(0, "Preço unitário não pode ser negativo"),
  discount: z.number().min(0, "Desconto não pode ser negativo").max(100, "Desconto não pode ser maior que 100%").default(0),
});

export const quoteSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  profitPercentage: z.number().min(0, "Percentual de lucro não pode ser negativo").max(100, "Percentual de lucro não pode ser maior que 100%").default(0),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  terms: z.string().optional(),
  tags: z.array(z.string()).default([]),
  items: z.array(quoteItemSchema).default([]),
  serviceItems: z.array(serviceItemSchema).default([]),
});

// Transaction schemas
export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  value: z.number().min(0, "Valor deve ser maior que 0"),
  description: z.string().min(1, "Descrição é obrigatória"),
  paymentMethod: z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "BANK_TRANSFER", "PIX", "BOLETO", "CHECK"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  dueDate: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).default("PENDING"),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  referenceId: z.string().optional(),
});

// Filter schemas
export const baseFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const productFilterSchema = baseFilterSchema.extend({
  category: z.string().optional(),
  active: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

export const serviceFilterSchema = baseFilterSchema.extend({
  category: z.string().optional(),
  active: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

export const clientFilterSchema = baseFilterSchema.extend({
  personType: z.enum(["FISICA", "JURIDICA"]).optional(),
  category: z.enum(["POTENTIAL", "REGULAR", "VIP"]).optional(),
  active: z.boolean().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const quoteFilterSchema = baseFilterSchema.extend({
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "EXPIRED"]).optional(),
  clientId: z.string().optional(),
  minValue: z.number().min(0).optional(),
  maxValue: z.number().min(0).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const transactionFilterSchema = baseFilterSchema.extend({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  paymentMethod: z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "BANK_TRANSFER", "PIX", "BOLETO", "CHECK"]).optional(),
  category: z.string().optional(),
  minValue: z.number().min(0).optional(),
  maxValue: z.number().min(0).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Settings schemas
export const companySettingsSchema = z.object({
  companyName: z.string().optional(),
  companyDocument: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  companyAddress: z.string().optional(),
  companyLogo: z.string().optional(),
});

export const systemSettingsSchema = z.object({
  currency: z.string().default("BRL"),
  dateFormat: z.string().default("DD/MM/YYYY"),
  timezone: z.string().default("America/Sao_Paulo"),
  language: z.string().default("pt-BR"),
  theme: z.string().default("light"),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  quoteExpiration: z.boolean().default(true),
  serviceOrderUpdates: z.boolean().default(true),
  transactionReminders: z.boolean().default(true),
  systemUpdates: z.boolean().default(false),
});