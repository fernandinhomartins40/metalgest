import Joi from 'joi';

// Auth validation schemas
export const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false),
    keepConnected: Joi.boolean().default(false),
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  requestPasswordReset: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),
};

// User validation schemas
export const userSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('ADMIN', 'USER', 'FINANCEIRO', 'COMERCIAL', 'PRODUCAO').default('USER'),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    role: Joi.string().valid('ADMIN', 'USER', 'FINANCEIRO', 'COMERCIAL', 'PRODUCAO'),
    active: Joi.boolean(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
    role: Joi.string().valid('ADMIN', 'USER', 'FINANCEIRO', 'COMERCIAL', 'PRODUCAO'),
    active: Joi.boolean(),
  }),
};

// Product validation schemas
export const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).allow(''),
    price: Joi.number().positive().required(),
    category: Joi.string().required(),
    stock: Joi.number().integer().min(0).default(0),
    minStock: Joi.number().integer().min(0).default(0),
    sku: Joi.string().max(50).allow(''),
    barcode: Joi.string().max(50).allow(''),
    weight: Joi.number().positive().allow(null),
    dimensions: Joi.string().max(100).allow(''),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200),
    description: Joi.string().max(1000).allow(''),
    price: Joi.number().positive(),
    category: Joi.string(),
    stock: Joi.number().integer().min(0),
    minStock: Joi.number().integer().min(0),
    sku: Joi.string().max(50).allow(''),
    barcode: Joi.string().max(50).allow(''),
    weight: Joi.number().positive().allow(null),
    dimensions: Joi.string().max(100).allow(''),
    active: Joi.boolean(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
    category: Joi.string().allow(''),
    lowStock: Joi.boolean(),
    active: Joi.boolean(),
  }),
};

// Service validation schemas
export const serviceSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).allow(''),
    price: Joi.number().positive().required(),
    category: Joi.string().required(),
    duration: Joi.number().integer().min(1).allow(null),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200),
    description: Joi.string().max(1000).allow(''),
    price: Joi.number().positive(),
    category: Joi.string(),
    duration: Joi.number().integer().min(1).allow(null),
    active: Joi.boolean(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
    category: Joi.string().allow(''),
    active: Joi.boolean(),
  }),
};

// Client validation schemas
export const clientSchemas = {
  create: Joi.object({
    personType: Joi.string().valid('FISICA', 'JURIDICA').required(),
    name: Joi.string().min(2).max(200).required(),
    tradingName: Joi.string().max(200).allow(''),
    document: Joi.string().required(),
    stateRegistration: Joi.string().max(20).allow(''),
    municipalRegistration: Joi.string().max(20).allow(''),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).allow(''),
    street: Joi.string().max(200).allow(''),
    number: Joi.string().max(20).allow(''),
    complement: Joi.string().max(100).allow(''),
    neighborhood: Joi.string().max(100).allow(''),
    city: Joi.string().max(100).allow(''),
    state: Joi.string().length(2).allow(''),
    phone: Joi.string().max(20).allow(''),
    mobile: Joi.string().max(20).allow(''),
    email: Joi.string().email().allow(''),
    contactName: Joi.string().max(100).allow(''),
    contactRole: Joi.string().max(100).allow(''),
    category: Joi.string().valid('POTENTIAL', 'REGULAR', 'VIP').default('REGULAR'),
    notes: Joi.string().max(1000).allow(''),
  }),

  update: Joi.object({
    personType: Joi.string().valid('FISICA', 'JURIDICA'),
    name: Joi.string().min(2).max(200),
    tradingName: Joi.string().max(200).allow(''),
    document: Joi.string(),
    stateRegistration: Joi.string().max(20).allow(''),
    municipalRegistration: Joi.string().max(20).allow(''),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).allow(''),
    street: Joi.string().max(200).allow(''),
    number: Joi.string().max(20).allow(''),
    complement: Joi.string().max(100).allow(''),
    neighborhood: Joi.string().max(100).allow(''),
    city: Joi.string().max(100).allow(''),
    state: Joi.string().length(2).allow(''),
    phone: Joi.string().max(20).allow(''),
    mobile: Joi.string().max(20).allow(''),
    email: Joi.string().email().allow(''),
    contactName: Joi.string().max(100).allow(''),
    contactRole: Joi.string().max(100).allow(''),
    category: Joi.string().valid('POTENTIAL', 'REGULAR', 'VIP'),
    notes: Joi.string().max(1000).allow(''),
    active: Joi.boolean(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
    category: Joi.string().valid('POTENTIAL', 'REGULAR', 'VIP'),
    personType: Joi.string().valid('FISICA', 'JURIDICA'),
    active: Joi.boolean(),
  }),
};

// Quote validation schemas
export const quoteSchemas = {
  create: Joi.object({
    clientId: Joi.string().uuid().required(),
    description: Joi.string().min(10).max(1000).required(),
    profitPercentage: Joi.number().min(0).max(100).default(0),
    tags: Joi.array().items(Joi.string()).default([]),
    notes: Joi.string().max(1000).allow(''),
    validUntil: Joi.date().iso().allow(null),
    terms: Joi.string().max(2000).allow(''),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        description: Joi.string().max(500).allow(''),
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().positive().required(),
        discount: Joi.number().min(0).max(100).default(0),
      })
    ).min(1).required(),
    serviceItems: Joi.array().items(
      Joi.object({
        serviceId: Joi.string().uuid().required(),
        description: Joi.string().max(500).allow(''),
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().positive().required(),
        discount: Joi.number().min(0).max(100).default(0),
      })
    ).default([]),
  }),

  update: Joi.object({
    clientId: Joi.string().uuid(),
    description: Joi.string().min(10).max(1000),
    profitPercentage: Joi.number().min(0).max(100),
    status: Joi.string().valid('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'),
    tags: Joi.array().items(Joi.string()),
    notes: Joi.string().max(1000).allow(''),
    validUntil: Joi.date().iso().allow(null),
    terms: Joi.string().max(2000).allow(''),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
    status: Joi.string().valid('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'),
    clientId: Joi.string().uuid(),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
  }),

  publicResponse: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    comments: Joi.string().max(1000).allow(''),
  }),
};

// Transaction validation schemas
export const transactionSchemas = {
  create: Joi.object({
    type: Joi.string().valid('INCOME', 'EXPENSE').required(),
    value: Joi.number().positive().required(),
    description: Joi.string().min(3).max(500).required(),
    paymentMethod: Joi.string().valid('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'PIX', 'BOLETO', 'CHECK').required(),
    category: Joi.string().required(),
    date: Joi.date().iso().required(),
    dueDate: Joi.date().iso().allow(null),
    notes: Joi.string().max(1000).allow(''),
    tags: Joi.array().items(Joi.string()).default([]),
    referenceId: Joi.string().uuid().allow(null),
  }),

  update: Joi.object({
    type: Joi.string().valid('INCOME', 'EXPENSE'),
    value: Joi.number().positive(),
    description: Joi.string().min(3).max(500),
    paymentMethod: Joi.string().valid('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'PIX', 'BOLETO', 'CHECK'),
    category: Joi.string(),
    date: Joi.date().iso(),
    dueDate: Joi.date().iso().allow(null),
    paidAt: Joi.date().iso().allow(null),
    status: Joi.string().valid('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'),
    notes: Joi.string().max(1000).allow(''),
    tags: Joi.array().items(Joi.string()),
    referenceId: Joi.string().uuid().allow(null),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
    type: Joi.string().valid('INCOME', 'EXPENSE'),
    category: Joi.string().allow(''),
    paymentMethod: Joi.string().valid('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'PIX', 'BOLETO', 'CHECK'),
    status: Joi.string().valid('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
  }),
};

// Service Order validation schemas
export const serviceOrderSchemas = {
  create: Joi.object({
    quoteId: Joi.string().uuid().required(),
    clientId: Joi.string().uuid().required(),
    responsibleId: Joi.string().uuid().required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    deadline: Joi.date().iso().allow(null),
    startDate: Joi.date().iso().allow(null),
    notes: Joi.string().max(1000).allow(''),
    tags: Joi.array().items(Joi.string()).default([]),
    estimatedHours: Joi.number().integer().min(1).allow(null),
  }),

  update: Joi.object({
    responsibleId: Joi.string().uuid(),
    status: Joi.string().valid('WAITING', 'IN_PROGRESS', 'PAUSED', 'FINISHED', 'DELIVERED', 'CANCELLED'),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    deadline: Joi.date().iso().allow(null),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(null),
    notes: Joi.string().max(1000).allow(''),
    tags: Joi.array().items(Joi.string()),
    estimatedHours: Joi.number().integer().min(1).allow(null),
    actualHours: Joi.number().integer().min(1).allow(null),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
    status: Joi.string().valid('WAITING', 'IN_PROGRESS', 'PAUSED', 'FINISHED', 'DELIVERED', 'CANCELLED'),
    clientId: Joi.string().uuid(),
    responsibleId: Joi.string().uuid(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
  }),
};

// Settings validation schemas
export const settingsSchemas = {
  update: Joi.object({
    companyName: Joi.string().max(200).allow(''),
    companyDocument: Joi.string().max(20).allow(''),
    companyPhone: Joi.string().max(20).allow(''),
    companyEmail: Joi.string().email().allow(''),
    companyAddress: Joi.string().max(500).allow(''),
    companyLogo: Joi.string().max(500).allow(''),
    notificationSettings: Joi.object(),
    systemSettings: Joi.object(),
    quoteSettings: Joi.object(),
    invoiceSettings: Joi.object(),
  }),
};

// Common parameter schemas
export const paramSchemas = {
  id: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  token: Joi.object({
    token: Joi.string().required(),
  }),
};

// Query parameter schemas
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export default {
  authSchemas,
  userSchemas,
  productSchemas,
  serviceSchemas,
  clientSchemas,
  quoteSchemas,
  transactionSchemas,
  serviceOrderSchemas,
  settingsSchemas,
  paramSchemas,
  querySchemas,
};