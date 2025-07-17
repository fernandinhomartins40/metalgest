// Application Constants
export const APP_NAME = "MetalGest"
export const APP_VERSION = "1.0.0"

// Route Constants
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PUBLIC_QUOTE: "/quote/:token",
  APP: "/app",
  DASHBOARD: "/app",
  CLIENTS: "/app/clients",
  QUOTES: "/app/quotes",
  PRODUCTION: "/app/production",
  PRODUCTS: "/app/products",
  SERVICES: "/app/services",
  FINANCIAL: "/app/financial",
  DRE: "/app/dre",
  USERS: "/app/users",
  SETTINGS: "/app/settings",
}

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: "metalgest_user",
  CREDENTIALS: "metalgest_credentials",
  PREFERENCES: "metalgest_preferences",
  THEME: "metalgest_theme",
}

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
}

// Quote Status
export const QUOTE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
}

// Product Categories
export const PRODUCT_CATEGORIES = {
  MATERIALS: "materials",
  TOOLS: "tools",
  SERVICES: "services",
  OTHER: "other",
}

// Form Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
}

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "dd/MM/yyyy",
  DISPLAY_WITH_TIME: "dd/MM/yyyy HH:mm",
  ISO: "yyyy-MM-dd",
  API: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
}

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    SAVE: "Dados salvos com sucesso!",
    DELETE: "Item excluído com sucesso!",
    UPDATE: "Dados atualizados com sucesso!",
    LOGIN: "Login realizado com sucesso!",
    LOGOUT: "Logout realizado com sucesso!",
  },
  ERROR: {
    SAVE: "Erro ao salvar dados.",
    DELETE: "Erro ao excluir item.",
    UPDATE: "Erro ao atualizar dados.",
    LOGIN: "Erro ao fazer login.",
    NETWORK: "Erro de conexão.",
    UNAUTHORIZED: "Acesso não autorizado.",
    VALIDATION: "Dados inválidos.",
  },
}

// Permissions
export const PERMISSIONS = {
  MODULES: {
    DASHBOARD: "dashboard",
    CLIENTS: "clients",
    QUOTES: "quotes",
    PRODUCTION: "production",
    PRODUCTS: "products",
    SERVICES: "services",
    FINANCIAL: "financial",
    DRE: "dre",
    USERS: "users",
    SETTINGS: "settings",
  },
  ACTIONS: {
    CREATE: "create",
    READ: "read",
    UPDATE: "update",
    DELETE: "delete",
  },
}