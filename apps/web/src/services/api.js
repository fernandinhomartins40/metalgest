import { httpClient } from "./httpClient"

const createError = (response, fallbackMessage) => {
  const error = new Error(response?.error?.message || fallbackMessage)
  error.code = response?.error?.code
  error.status = response?.error?.status
  error.details = response?.error?.details
  return error
}

const unwrap = async (request, fallbackMessage) => {
  const response = await request

  if (!response.success) {
    throw createError(response, fallbackMessage)
  }

  return response.data
}

const flattenObject = (value, prefix = "", result = {}) => {
  Object.entries(value || {}).forEach(([key, currentValue]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key

    if (
      currentValue &&
      typeof currentValue === "object" &&
      !Array.isArray(currentValue) &&
      !(currentValue instanceof Date)
    ) {
      flattenObject(currentValue, nextKey, result)
    } else {
      result[nextKey] = String(currentValue ?? "")
    }
  })

  return result
}

const getDateRangeByPeriod = (period = "month") => {
  const now = new Date()
  const startDate = new Date(now)

  if (period === "year") {
    startDate.setMonth(0, 1)
  } else if (period === "quarter") {
    startDate.setMonth(now.getMonth() - 2, 1)
  } else {
    startDate.setDate(1)
  }

  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  }
}

const buildDreReport = async (period = "month") => {
  const range = getDateRangeByPeriod(period)
  const [balance, summary] = await Promise.all([
    api.transactions.getBalance(range),
    api.transactions.getSummaryByCategory(range),
  ])

  const incomeEntries = summary.filter((item) => item.type === "INCOME")
  const expenseEntries = summary.filter((item) => item.type === "EXPENSE")

  const receitaBruta = Number(balance.income.total || 0)
  const despesasOperacionais = Number(balance.expenses.total || 0)
  const impostos = expenseEntries
    .filter((item) => /imposto|tribut/i.test(item.category))
    .reduce((sum, item) => sum + Number(item.total || 0), 0)
  const custos = expenseEntries
    .filter((item) => /custo|cmv/i.test(item.category))
    .reduce((sum, item) => sum + Number(item.total || 0), 0)
  const despesasFinanceiras = expenseEntries
    .filter((item) => /financeir/i.test(item.category))
    .reduce((sum, item) => sum + Number(item.total || 0), 0)
  const receitasFinanceiras = incomeEntries
    .filter((item) => /financeir/i.test(item.category))
    .reduce((sum, item) => sum + Number(item.total || 0), 0)

  const receitaLiquida = receitaBruta - impostos
  const lucroBruto = receitaLiquida - custos
  const resultadoOperacional = lucroBruto - despesasOperacionais
  const resultadoFinanceiro = receitasFinanceiras - despesasFinanceiras
  const lucroLiquido = resultadoOperacional + resultadoFinanceiro

  return {
    receitaBruta,
    impostos,
    receitaLiquida,
    custos,
    lucroBruto,
    despesasOperacionais,
    resultadoOperacional,
    resultadoFinanceiro,
    lucroLiquido,
    detalhamento: {
      receitas: incomeEntries.reduce((acc, item) => {
        acc[item.category] = Number(item.total || 0)
        return acc
      }, {}),
      impostos: expenseEntries
        .filter((item) => /imposto|tribut/i.test(item.category))
        .reduce((acc, item) => {
          acc[item.category] = Number(item.total || 0)
          return acc
        }, {}),
      custos: expenseEntries
        .filter((item) => /custo|cmv/i.test(item.category))
        .reduce((acc, item) => {
          acc[item.category] = Number(item.total || 0)
          return acc
        }, {}),
      despesas: expenseEntries.reduce((acc, item) => {
        acc[item.category] = Number(item.total || 0)
        return acc
      }, {}),
      financeiro: {
        receitas: receitasFinanceiras,
        despesas: despesasFinanceiras,
      },
    },
  }
}

export const api = {
  upload: {
    logo: async (file) => {
      const formData = new FormData()
      formData.append("file", file)
      return unwrap(httpClient.upload("/upload/logo", formData), "Failed to upload logo")
    },
    document: async (file) => {
      const formData = new FormData()
      formData.append("file", file)
      return unwrap(httpClient.upload("/upload/documents", formData), "Failed to upload document")
    },
  },

  dashboard: {
    getStats: () => unwrap(httpClient.get("/dashboard/stats"), "Failed to load dashboard stats"),
    getRevenueChart: (year) =>
      unwrap(httpClient.get("/dashboard/revenue-chart", { year }), "Failed to load revenue chart"),
    getQuotesConversion: () =>
      unwrap(httpClient.get("/dashboard/quotes-conversion"), "Failed to load conversion rate"),
    getTopClients: (limit = 10) =>
      unwrap(httpClient.get("/dashboard/top-clients", { limit }), "Failed to load top clients"),
  },

  products: {
    list: async (params = {}) => (await unwrap(httpClient.get("/products", params), "Failed to list products")).products,
    listWithPagination: (params = {}) => unwrap(httpClient.get("/products", params), "Failed to list products"),
    search: (params = {}) =>
      api.products.list({
        search: params.term,
        category: params.category && params.category !== "all" ? params.category : undefined,
      }),
    get: (id) => unwrap(httpClient.get(`/products/${id}`), "Failed to load product"),
    create: (payload) => unwrap(httpClient.post("/products", payload), "Failed to create product"),
    update: (id, payload) => unwrap(httpClient.put(`/products/${id}`, payload), "Failed to update product"),
    delete: (id) => unwrap(httpClient.delete(`/products/${id}`), "Failed to delete product"),
    updateStock: (id, quantity, operation = "set") =>
      unwrap(httpClient.patch(`/products/${id}/stock`, { quantity, operation }), "Failed to update stock"),
    getLowStock: () => unwrap(httpClient.get("/products/low-stock"), "Failed to load low stock products"),
    getCategories: () => unwrap(httpClient.get("/products/categories"), "Failed to load product categories"),
  },

  services: {
    list: async (params = {}) => (await unwrap(httpClient.get("/services", params), "Failed to list services")).services,
    listWithPagination: (params = {}) => unwrap(httpClient.get("/services", params), "Failed to list services"),
    search: (params = {}) =>
      api.services.list({
        search: params.term,
        category: params.category && params.category !== "all" ? params.category : undefined,
      }),
    get: (id) => unwrap(httpClient.get(`/services/${id}`), "Failed to load service"),
    create: (payload) => unwrap(httpClient.post("/services", payload), "Failed to create service"),
    update: (id, payload) => unwrap(httpClient.put(`/services/${id}`, payload), "Failed to update service"),
    delete: (id) => unwrap(httpClient.delete(`/services/${id}`), "Failed to delete service"),
    getCategories: () => unwrap(httpClient.get("/services/categories"), "Failed to load service categories"),
  },

  clients: {
    list: async (params = {}) => (await unwrap(httpClient.get("/clients", params), "Failed to list clients")).clients,
    listWithPagination: (params = {}) => unwrap(httpClient.get("/clients", params), "Failed to list clients"),
    get: (id) => unwrap(httpClient.get(`/clients/${id}`), "Failed to load client"),
    create: (payload) => unwrap(httpClient.post("/clients", payload), "Failed to create client"),
    update: (id, payload) => unwrap(httpClient.put(`/clients/${id}`, payload), "Failed to update client"),
    delete: (id) => unwrap(httpClient.delete(`/clients/${id}`), "Failed to delete client"),
    getStats: (id) => unwrap(httpClient.get(`/clients/${id}/stats`), "Failed to load client stats"),
  },

  quotes: {
    list: async (params = {}) => (await unwrap(httpClient.get("/quotes", params), "Failed to list quotes")).quotes,
    listWithPagination: (params = {}) => unwrap(httpClient.get("/quotes", params), "Failed to list quotes"),
    get: (id) => unwrap(httpClient.get(`/quotes/${id}`), "Failed to load quote"),
    getByPublicToken: (token) =>
      unwrap(httpClient.get(`/quotes/public/${token}`), "Failed to load public quote"),
    getPublicQuote: (token) => api.quotes.getByPublicToken(token),
    create: (payload) => unwrap(httpClient.post("/quotes", payload), "Failed to create quote"),
    update: (id, payload) => unwrap(httpClient.put(`/quotes/${id}`, payload), "Failed to update quote"),
    delete: (id) => unwrap(httpClient.delete(`/quotes/${id}`), "Failed to delete quote"),
    updateStatus: (id, status) =>
      unwrap(httpClient.patch(`/quotes/${id}/status`, { status }), "Failed to update quote status"),
    updatePublicQuoteResponse: (token, payload) =>
      unwrap(
        httpClient.patch(`/quotes/public/${token}/status`, {
          status: String(payload.status || "").toUpperCase(),
        }),
        "Failed to update public quote response"
      ),
    togglePublicLink: (id, enabled) =>
      unwrap(httpClient.patch(`/quotes/${id}/public-link`, { enabled }), "Failed to toggle public link"),
    duplicate: (id) => unwrap(httpClient.post(`/quotes/${id}/duplicate`), "Failed to duplicate quote"),
  },

  serviceOrders: {
    list: async (params = {}) =>
      (await unwrap(httpClient.get("/service-orders", params), "Failed to list service orders")).orders,
    listWithPagination: (params = {}) =>
      unwrap(httpClient.get("/service-orders", params), "Failed to list service orders"),
    get: (id) => unwrap(httpClient.get(`/service-orders/${id}`), "Failed to load service order"),
    create: (payload) => unwrap(httpClient.post("/service-orders", payload), "Failed to create service order"),
    update: (id, payload) => unwrap(httpClient.put(`/service-orders/${id}`, payload), "Failed to update service order"),
    delete: (id) => unwrap(httpClient.delete(`/service-orders/${id}`), "Failed to delete service order"),
    updateStatus: (id, status) =>
      unwrap(httpClient.patch(`/service-orders/${id}/status`, { status }), "Failed to update service order status"),
  },

  transactions: {
    list: async (params = {}) =>
      (await unwrap(httpClient.get("/transactions", params), "Failed to list transactions")).transactions,
    listWithPagination: (params = {}) =>
      unwrap(httpClient.get("/transactions", params), "Failed to list transactions"),
    get: (id) => unwrap(httpClient.get(`/transactions/${id}`), "Failed to load transaction"),
    create: (payload) => unwrap(httpClient.post("/transactions", payload), "Failed to create transaction"),
    update: (id, payload) => unwrap(httpClient.put(`/transactions/${id}`, payload), "Failed to update transaction"),
    delete: (id) => unwrap(httpClient.delete(`/transactions/${id}`), "Failed to delete transaction"),
    getBalance: (params = {}) => unwrap(httpClient.get("/transactions/balance", params), "Failed to load balance"),
    getSummaryByCategory: (params = {}) =>
      unwrap(httpClient.get("/transactions/summary/category", params), "Failed to load category summary"),
    getSummaryByMonth: (year) =>
      unwrap(httpClient.get("/transactions/summary/month", { year }), "Failed to load monthly summary"),
  },

  financial: {
    create: (payload) =>
      api.transactions.create({
        ...payload,
        amount: payload.amount ?? payload.value,
        type: String(payload.type || "").toUpperCase(),
      }),
    list: async (params = {}) => {
      const transactions = await api.transactions.list(params)
      return transactions.map((transaction) => ({
        ...transaction,
        value: Number(transaction.amount || 0),
        type: transaction.type?.toLowerCase(),
      }))
    },
    getSummary: async (startDate, endDate) => {
      const balance = await api.transactions.getBalance({ startDate, endDate })
      return {
        totalIncome: Number(balance.income.total || 0),
        totalExpense: Number(balance.expenses.total || 0),
        netBalance: Number(balance.balance || 0),
        categorySummary: [],
      }
    },
  },

  dre: {
    getReport: (period) => buildDreReport(period),
    getHistorical: async (months = 12) => {
      const year = new Date().getFullYear()
      const data = await api.transactions.getSummaryByMonth(year)
      return data.slice(-months).map((entry) => ({
        month: entry.month,
        lucroLiquido: Number(entry.balance || 0),
        receitas: Number(entry.income || 0),
        despesas: Number(entry.expenses || 0),
      }))
    },
    getComparative: async (period) => {
      const current = await buildDreReport(period)
      const previous = await buildDreReport(period === "year" ? "quarter" : "month")
      return {
        atual: current,
        anterior: previous,
      }
    },
  },

  users: {
    list: async (params = {}) => (await unwrap(httpClient.get("/users", params), "Failed to list users")).users,
    listWithPagination: (params = {}) => unwrap(httpClient.get("/users", params), "Failed to list users"),
    get: (id) => unwrap(httpClient.get(`/users/${id}`), "Failed to load user"),
    create: (payload) =>
      unwrap(
        httpClient.post("/users", {
          ...payload,
          role: String(payload.role || "USER").toUpperCase(),
        }),
        "Failed to create user"
      ),
    update: (id, payload) =>
      unwrap(
        httpClient.put(`/users/${id}`, {
          ...payload,
          role: payload.role ? String(payload.role).toUpperCase() : undefined,
        }),
        "Failed to update user"
      ),
    toggleStatus: (id, active) => api.users.update(id, { active }),
    delete: (id) => unwrap(httpClient.delete(`/users/${id}`), "Failed to delete user"),
    resetPassword: (id, newPassword) =>
      unwrap(httpClient.post(`/users/${id}/reset-password`, { newPassword }), "Failed to reset password"),
    getStats: (id) => unwrap(httpClient.get(`/users/${id}/stats`), "Failed to load user stats"),
  },

  settings: {
    list: () => unwrap(httpClient.get("/settings"), "Failed to list settings"),
    get: (key) => unwrap(httpClient.get(`/settings/${key}`), "Failed to load setting"),
    upsert: (key, value) => unwrap(httpClient.put(`/settings/${key}`, { value }), "Failed to save setting"),
    updateBulk: (settings) => unwrap(httpClient.post("/settings/bulk", settings), "Failed to save settings"),
    delete: (key) => unwrap(httpClient.delete(`/settings/${key}`), "Failed to delete setting"),
    getCompany: () => unwrap(httpClient.get("/settings/company"), "Failed to load company settings"),
    updateCompany: (payload) =>
      unwrap(httpClient.put("/settings/company", payload), "Failed to update company settings"),
    getCompanyData: () => api.settings.getCompany(),
    saveCompanyData: async (data, logoFile) => {
      const nextPayload = { ...data }

      if (logoFile) {
        const upload = await api.upload.logo(logoFile)
        nextPayload.logo = upload.url
      }

      return api.settings.updateCompany(nextPayload)
    },
    getSystemSettings: () => api.settings.list(),
    saveSystemSettings: (settings) => api.settings.updateBulk(flattenObject(settings)),
  },
}

export default api
