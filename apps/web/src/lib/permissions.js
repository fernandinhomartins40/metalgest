const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER",
}

const MODULES = {
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
}

const roleAccess = {
  [ROLES.ADMIN]: Object.values(MODULES),
  [ROLES.MANAGER]: [
    MODULES.DASHBOARD,
    MODULES.CLIENTS,
    MODULES.QUOTES,
    MODULES.PRODUCTION,
    MODULES.PRODUCTS,
    MODULES.SERVICES,
    MODULES.FINANCIAL,
    MODULES.DRE,
    MODULES.SETTINGS,
  ],
  [ROLES.USER]: [
    MODULES.DASHBOARD,
    MODULES.CLIENTS,
    MODULES.QUOTES,
    MODULES.PRODUCTION,
    MODULES.PRODUCTS,
    MODULES.SERVICES,
    MODULES.FINANCIAL,
    MODULES.SETTINGS,
  ],
}

export const permissions = {
  hasAccess: (module, user) => {
    if (!user?.role) return false
    if (user.role === ROLES.ADMIN) return true
    return roleAccess[user.role]?.includes(module) || false
  },

  getAccessibleModules: (user) => {
    if (!user?.role) return []
    if (user.role === ROLES.ADMIN) return Object.values(MODULES)
    return roleAccess[user.role] || roleAccess[ROLES.USER]
  },

  ROLES,
  MODULES,
}
