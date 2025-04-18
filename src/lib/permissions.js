
import { storage } from "@/lib/storage"

const ROLES = {
  ADMIN: "admin",
  FINANCEIRO: "financeiro",
  COMERCIAL: "comercial",
  PRODUCAO: "producao"
}

const MODULES = {
  DASHBOARD: "dashboard",
  CLIENTS: "clients",
  QUOTES: "quotes",
  PRODUCTION: "production",
  PRODUCTS: "products",
  FINANCIAL: "financial",
  DRE: "dre",
  USERS: "users",
  SETTINGS: "settings"
}

const roleAccess = {
  [ROLES.ADMIN]: [
    MODULES.DASHBOARD,
    MODULES.CLIENTS,
    MODULES.QUOTES,
    MODULES.PRODUCTION,
    MODULES.PRODUCTS,
    MODULES.FINANCIAL,
    MODULES.DRE,
    MODULES.USERS,
    MODULES.SETTINGS
  ],
  [ROLES.FINANCEIRO]: [
    MODULES.DASHBOARD,
    MODULES.FINANCIAL,
    MODULES.DRE
  ],
  [ROLES.COMERCIAL]: [
    MODULES.DASHBOARD,
    MODULES.CLIENTS,
    MODULES.QUOTES
  ],
  [ROLES.PRODUCAO]: [
    MODULES.DASHBOARD,
    MODULES.PRODUCTION,
    MODULES.PRODUCTS
  ]
}

export const permissions = {
  hasAccess: (module) => {
    const user = storage.get("user")
    if (!user || !user.role) return false
    
    if (user.role === ROLES.ADMIN) return true
    
    return roleAccess[user.role]?.includes(module) || false
  },

  getAccessibleModules: () => {
    const user = storage.get("user")
    if (!user || !user.role) return []
    
    if (user.role === ROLES.ADMIN) {
      return Object.values(MODULES)
    }
    
    return roleAccess[user.role] || []
  },

  ROLES,
  MODULES
}
