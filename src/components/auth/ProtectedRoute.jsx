
import React, { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { auth } from "../../services/auth"
import { storage } from "../../utils/storage"
import { permissions } from "../../lib/permissions"
import { Loading } from "../ui/loading"
import { useToast } from "../ui/use-toast"

function ProtectedRoute({ children, requiredModule }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        
        if (currentUser) {
          // User data already includes role from JWT token
          setUser(currentUser)
          
          // Update stored user if needed
          const storedUser = storage.get("user")
          if (!storedUser || storedUser.id !== currentUser.id) {
            storage.set("user", currentUser)
          }
        } else {
          // No valid user found, clear storage
          storage.remove("user")
          setUser(null)
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
