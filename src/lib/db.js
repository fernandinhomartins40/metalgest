
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export const db = {
  // Clients
  clients: {
    async create(data) {
      const { data: client, error } = await supabase
        .from("clients")
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return client
    },

    async update(id, data) {
      const { data: client, error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return client
    },

    async delete(id) {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)

      if (error) throw error
    },

    async getById(id) {
      const { data: client, error } = await supabase
        .from("clients")
        .select()
        .eq("id", id)
        .single()

      if (error) throw error
      return client
    },

    async list(filters = {}) {
      let query = supabase.from("clients").select()

      if (filters.category) {
        query = query.eq("category", filters.category)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,document.ilike.%${filters.search}%`)
      }

      const { data: clients, error } = await query

      if (error) throw error
      return clients
    }
  },

  // Products
  products: {
    async create(data) {
      const { data: product, error } = await supabase
        .from("products")
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return product
    },

    async update(id, data) {
      const { data: product, error } = await supabase
        .from("products")
        .update(data)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return product
    },

    async delete(id) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

      if (error) throw error
    },

    async getById(id) {
      const { data: product, error } = await supabase
        .from("products")
        .select()
        .eq("id", id)
        .single()

      if (error) throw error
      return product
    },

    async list(filters = {}) {
      let query = supabase.from("products").select()

      if (filters.type) {
        query = query.eq("type", filters.type)
      }
      if (filters.category) {
        query = query.eq("category", filters.category)
      }
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`)
      }
      if (filters.lowStock) {
        query = query.lte("stock", supabase.raw("min_stock"))
      }

      const { data: products, error } = await query

      if (error) throw error
      return products
    }
  },

  // Quotes
  quotes: {
    async create(data) {
      const { items, ...quoteData } = data
      
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert(quoteData)
        .select()
        .single()

      if (quoteError) throw quoteError

      if (items?.length) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(items.map(item => ({ ...item, quote_id: quote.id })))

        if (itemsError) throw itemsError
      }

      return quote
    },

    async update(id, data) {
      const { items, ...quoteData } = data

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .update(quoteData)
        .eq("id", id)
        .select()
        .single()

      if (quoteError) throw quoteError

      if (items) {
        // Delete existing items
        await supabase
          .from("quote_items")
          .delete()
          .eq("quote_id", id)

        // Insert new items
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(items.map(item => ({ ...item, quote_id: id })))

        if (itemsError) throw itemsError
      }

      return quote
    },

    async delete(id) {
      // Delete quote items first (foreign key constraint)
      await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", id)

      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id)

      if (error) throw error
    },

    async getById(id) {
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select(`
          *,
          client:clients(*),
          items:quote_items(
            *,
            product:products(*)
          )
        `)
        .eq("id", id)
        .single()

      if (quoteError) throw quoteError
      return quote
    },

    async list(filters = {}) {
      let query = supabase
        .from("quotes")
        .select(`
          *,
          client:clients(name),
          items:quote_items(
            *,
            product:products(name)
          )
        `)

      if (filters.status) {
        query = query.eq("status", filters.status)
      }
      if (filters.clientId) {
        query = query.eq("client_id", filters.clientId)
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate)
      }

      const { data: quotes, error } = await query

      if (error) throw error
      return quotes
    }
  },

  // Service Orders
  serviceOrders: {
    async create(data) {
      const { data: order, error } = await supabase
        .from("service_orders")
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return order
    },

    async update(id, data) {
      const { data: order, error } = await supabase
        .from("service_orders")
        .update(data)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return order
    },

    async delete(id) {
      const { error } = await supabase
        .from("service_orders")
        .delete()
        .eq("id", id)

      if (error) throw error
    },

    async getById(id) {
      const { data: order, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          quote:quotes(*),
          responsible:users(name)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return order
    },

    async list(filters = {}) {
      let query = supabase
        .from("service_orders")
        .select(`
          *,
          quote:quotes(*),
          responsible:users(name)
        `)

      if (filters.status) {
        query = query.eq("status", filters.status)
      }
      if (filters.responsibleId) {
        query = query.eq("responsible_id", filters.responsibleId)
      }

      const { data: orders, error } = await query

      if (error) throw error
      return orders
    }
  },

  // Financial Transactions
  transactions: {
    async create(data) {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return transaction
    },

    async update(id, data) {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .update(data)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return transaction
    },

    async delete(id) {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)

      if (error) throw error
    },

    async getById(id) {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .select()
        .eq("id", id)
        .single()

      if (error) throw error
      return transaction
    },

    async list(filters = {}) {
      let query = supabase.from("transactions").select()

      if (filters.type) {
        query = query.eq("type", filters.type)
      }
      if (filters.category) {
        query = query.eq("category", filters.category)
      }
      if (filters.startDate) {
        query = query.gte("date", filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte("date", filters.endDate)
      }

      const { data: transactions, error } = await query

      if (error) throw error
      return transactions
    },

    async getBalance(startDate, endDate) {
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select()
        .gte("date", startDate)
        .lte("date", endDate)

      if (error) throw error

      return transactions.reduce((acc, curr) => {
        return curr.type === "income" 
          ? acc + curr.value 
          : acc - curr.value
      }, 0)
    }
  },

  // Users
  users: {
    async create(data) {
      const { data: user, error } = await supabase
        .from("users")
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return user
    },

    async update(id, data) {
      const { data: user, error } = await supabase
        .from("users")
        .update(data)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return user
    },

    async delete(id) {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id)

      if (error) throw error
    },

    async getById(id) {
      const { data: user, error } = await supabase
        .from("users")
        .select()
        .eq("id", id)
        .single()

      if (error) throw error
      return user
    },

    async list(filters = {}) {
      let query = supabase.from("users").select()

      if (filters.status) {
        query = query.eq("status", filters.status)
      }
      if (filters.accessLevel) {
        query = query.eq("access_level", filters.accessLevel)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      const { data: users, error } = await query

      if (error) throw error
      return users
    }
  },

  // Settings
  settings: {
    async get() {
      const { data: settings, error } = await supabase
        .from("settings")
        .select()
        .single()

      if (error && error.code !== "PGRST116") throw error
      return settings
    },

    async update(data) {
      const { data: settings, error } = await supabase
        .from("settings")
        .upsert(data)
        .select()
        .single()

      if (error) throw error
      return settings
    }
  },

  // Audit Logs
  audit: {
    async log(action, details = {}) {
      const user = await supabase.auth.getUser()
      
      const logData = {
        user_id: user?.id,
        action,
        details,
        ip_address: window.location.hostname,
        user_agent: navigator.userAgent
      }

      const { error } = await supabase
        .from("audit_logs")
        .insert(logData)

      if (error) {
        console.error("Error logging audit:", error)
      }
    },

    async list(filters = {}) {
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          user:users(name)
        `)
        .order("created_at", { ascending: false })

      if (filters.userId) {
        query = query.eq("user_id", filters.userId)
      }
      if (filters.action) {
        query = query.eq("action", filters.action)
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate)
      }

      const { data: logs, error } = await query

      if (error) throw error
      return logs
    }
  }
}

// Error handler wrapper
export const withErrorHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error("Database error:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive"
      })
      throw error
    }
  }
}

// Wrap all methods with error handler
Object.keys(db).forEach(module => {
  Object.keys(db[module]).forEach(method => {
    db[module][method] = withErrorHandler(db[module][method])
  })
})
