
import { supabase } from "@/lib/supabase"
import { audit } from "@/lib/audit"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export const api = {
  dashboard: {
    // ... existing dashboard code ...
  },

  products: {
    list: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      await audit.log({
        action: "list",
        module: "products",
        details: { count: products?.length }
      })

      return products || []
    },

    create: async (productData) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: product, error } = await supabase
        .from("products")
        .insert([{
          ...productData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      await audit.log({
        action: "create",
        module: "products",
        details: { productId: product.id }
      })

      return product
    },

    update: async (id, productData) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: product, error } = await supabase
        .from("products")
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      await audit.log({
        action: "update",
        module: "products",
        details: { productId: id }
      })

      return product
    },

    delete: async (id) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      await audit.log({
        action: "delete",
        module: "products",
        details: { productId: id }
      })

      return true
    },

    search: async ({ term = "", category = "all" }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (term) {
        query = query.ilike("name", `%${term}%`)
      }

      if (category !== "all") {
        query = query.eq("category", category)
      }

      const { data: products, error } = await query

      if (error) throw error

      await audit.log({
        action: "search",
        module: "products",
        details: { term, category }
      })

      return products || []
    }
  },

  services: {
    list: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: services, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      await audit.log({
        action: "list",
        module: "services",
        details: { count: services?.length }
      })

      return services || []
    },

    create: async (serviceData) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: service, error } = await supabase
        .from("services")
        .insert([{
          ...serviceData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      await audit.log({
        action: "create",
        module: "services",
        details: { serviceId: service.id }
      })

      return service
    },

    update: async (id, serviceData) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: service, error } = await supabase
        .from("services")
        .update({
          ...serviceData,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      await audit.log({
        action: "update",
        module: "services",
        details: { serviceId: id }
      })

      return service
    },

    delete: async (id) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      await audit.log({
        action: "delete",
        module: "services",
        details: { serviceId: id }
      })

      return true
    },

    search: async ({ term = "", category = "all" }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (term) {
        query = query.ilike("name", `%${term}%`)
      }

      if (category !== "all") {
        query = query.eq("category", category)
      }

      const { data: services, error } = await query

      if (error) throw error

      await audit.log({
        action: "search",
        module: "services",
        details: { term, category }
      })

      return services || []
    }
  },

  financial: {
    // ... existing financial code ...
  },

  dre: {
    // ... existing dre code ...
  },

  users: {
    // ... existing users code ...
  },

  settings: {
    // ... existing settings code ...
  }
}
