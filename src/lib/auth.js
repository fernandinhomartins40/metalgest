
import { supabase } from "@/lib/supabase"
import { storage } from "@/lib/storage"
import CryptoJS from "crypto-js"

const ENCRYPTION_KEY = "metalgest_secure_key_2025" // Encryption key for password storage

export const auth = {
  login: async (email, password, rememberMe = false, keepConnected = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Set session duration to 30 days if keepConnected is true, otherwise 24 hours
        expiresIn: keepConnected ? 30 * 24 * 60 * 60 : 24 * 60 * 60
      }
    })

    if (error) throw error

    // Store user data and preferences
    storage.set("user", {
      id: data.user.id,
      email: data.user.email,
      role: "admin",
      rememberMe,
      keepConnected
    })

    // If rememberMe is true, store encrypted credentials
    if (rememberMe) {
      const encryptedPassword = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString()
      storage.set("credentials", { 
        email,
        password: encryptedPassword
      })
    } else {
      storage.remove("credentials")
    }

    // Set session persistence based on keepConnected preference
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    })

    return data
  },

  register: async (email, password, name) => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) throw error

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from("users")
      .insert([{
        id: user.id,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (profileError) throw profileError

    return user
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) throw error
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut({
      scope: 'local' // Only clear the current session
    })
    if (error) throw error
    
    // Keep remembered credentials if they exist
    const credentials = storage.get("credentials")
    storage.clear()
    if (credentials) {
      storage.set("credentials", credentials)
    }
  },

  getCurrentUser: async () => {
    const storedUser = storage.get("user")
    
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Session error:", sessionError)
      return null
    }

    if (session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("User error:", userError)
        return null
      }

      if (user) {
        // Update stored user if keepConnected was true
        if (storedUser?.keepConnected) {
          storage.set("user", {
            ...storedUser,
            id: user.id,
            email: user.email
          })
        }
        return user
      }
    }

    return null
  },

  validatePassword: (password) => {
    const hasMinLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSymbol]
      .filter(Boolean).length

    return {
      isValid: hasMinLength && hasUpperCase && hasNumber && hasSymbol,
      strength: strength / 5,
      requirements: {
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSymbol
      }
    }
  },

  getSavedCredentials: () => {
    const credentials = storage.get("credentials")
    if (credentials?.password) {
      try {
        const decryptedPassword = CryptoJS.AES.decrypt(credentials.password, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
        return {
          ...credentials,
          password: decryptedPassword
        }
      } catch (error) {
        console.error("Error decrypting password:", error)
        return { email: credentials.email }
      }
    }
    return credentials
  }
}
