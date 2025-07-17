
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { auth } from "../services/auth"
import { useToast } from "../components/ui/use-toast"

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true)
      
      // Try to get current user
      const currentUser = await auth.getCurrentUser()
      
      if (currentUser) {
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password, rememberMe = false, keepConnected = false) => {
    try {
      setLoading(true)
      const result = await auth.login(email, password, rememberMe, keepConnected)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setUser(result.user)
      
      return result
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await auth.logout()
      setUser(null)
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      })
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        variant: "destructive",
        title: "Erro no logout",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const register = useCallback(async (name, email, password) => {
    try {
      setLoading(true)
      const result = await auth.register(name, email, password)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setUser(result.user)
      
      toast({
        title: "Cadastro realizado",
        description: "Bem-vindo ao MetalGest!",
      })
      
      return result
    } catch (error) {
      console.error('Registration failed:', error)
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message,
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateProfile = useCallback(async (updateData) => {
    try {
      setLoading(true)
      const result = await auth.updateProfile(updateData)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setUser(result.user)
      return result
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    checkAuthStatus,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
