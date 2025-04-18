
import React, { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { auth } from "@/lib/auth"
import { storage } from "@/lib/storage"
import { permissions } from "@/lib/permissions"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/components/ui/use-toast"

function ProtectedRoute({ children, requiredModule }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = storage.get("user")
        
        if (!storedUser) {
          const currentUser = await auth.getCurrentUser()
          if (currentUser) {
            const { data: userData, error } = await supabase
              .from("users")
              .select("role")
              .eq("id", currentUser.id)
              .single()

            if (error) throw error

            storage.set("user", {
              id: currentUser.id,
              email: currentUser.email,
              role: userData.role
            })
            setUser(currentUser)
          } else {
            setUser(null)
          }
        } else {
          const currentUser = await auth.getCurrentUser()
          if (currentUser && currentUser.id === storedUser.id) {
            setUser(currentUser)
          } else {
            storage.remove("user")
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        storage.remove("user")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <Loading fullScreen />
  }

  if (!user) {
    storage.remove("user")
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check module access if requiredModule is specified
  if (requiredModule && !permissions.hasAccess(requiredModule)) {
    toast({
      variant: "destructive",
      title: "Acesso Restrito",
      description: "Você não tem permissão para acessar este módulo."
    })
    return <Navigate to="/app" replace />
  }

  return children
}

export default ProtectedRoute
