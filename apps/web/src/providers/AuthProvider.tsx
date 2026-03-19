import React, { createContext, useContext, useEffect, useState } from "react"
import auth from "../services/auth"

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  active: boolean
  emailVerified?: boolean
}

interface LoginResult {
  success: boolean
  user: AuthUser
  verificationRequired?: boolean
  message?: string
  emailDispatched?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>
  register: (name: string, email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = async (email: string, password: string, rememberMe = false) => {
    const result = await auth.login(email, password, rememberMe)
    setUser(result.user)
    return result
  }

  const register = async (name: string, email: string, password: string, rememberMe = true) => {
    const result = await auth.register(name, email, password, rememberMe)
    setUser(result.verificationRequired ? null : result.user)
    return result
  }

  const logout = async () => {
    try {
      await auth.logout()
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
