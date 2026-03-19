import { httpClient, TokenManager } from "./httpClient"

const STORAGE_KEYS = {
  LOGIN_HINT: "metalgest_login_hint",
}

const getUserStorage = () => {
  if (typeof window === "undefined") {
    return null
  }

  if (sessionStorage.getItem("metalgest_user") !== null) {
    return sessionStorage
  }

  if (localStorage.getItem("metalgest_user") !== null) {
    return localStorage
  }

  if (sessionStorage.getItem("metalgest_access_token") !== null) {
    return sessionStorage
  }

  return localStorage
}

const saveUser = (user, rememberMe) => {
  if (typeof window === "undefined" || !user) {
    return
  }

  const targetStorage =
    rememberMe === true ? localStorage : rememberMe === false ? sessionStorage : getUserStorage()
  const fallbackStorage = targetStorage === localStorage ? sessionStorage : localStorage

  targetStorage.setItem("metalgest_user", JSON.stringify(user))
  fallbackStorage.removeItem("metalgest_user")
}

const getStoredUser = () => {
  try {
    const value = sessionStorage.getItem("metalgest_user") || localStorage.getItem("metalgest_user")
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const clearUser = () => {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.removeItem("metalgest_user")
  localStorage.removeItem("metalgest_user")
}

const saveLoginHint = (email) => {
  localStorage.setItem(STORAGE_KEYS.LOGIN_HINT, JSON.stringify({ email }))
}

const clearLoginHint = () => {
  localStorage.removeItem(STORAGE_KEYS.LOGIN_HINT)
}

const getSavedCredentials = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.LOGIN_HINT)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const createError = (response, fallbackMessage) => {
  const error = new Error(response?.error?.message || fallbackMessage)
  error.code = response?.error?.code
  error.status = response?.error?.status
  error.details = response?.error?.details
  return error
}

const validatePassword = (password) => {
  const requirements = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  }

  const passedChecks = Object.values(requirements).filter(Boolean).length

  return {
    strength: passedChecks / 5,
    requirements,
    isValid: passedChecks === 5,
  }
}

export const AuthService = {
  async login(email, password, rememberMe = false) {
    const response = await httpClient.post("/auth/login", { email, password, rememberMe })

    if (!response.success) {
      throw createError(response, "Login failed")
    }

    TokenManager.setAccessToken(response.data.accessToken, rememberMe)
    saveUser(response.data.user, rememberMe)

    if (rememberMe) {
      saveLoginHint(email)
    } else {
      clearLoginHint()
    }

    return {
      success: true,
      user: response.data.user,
      verificationRequired: false,
      message: response.data.message,
    }
  },

  async register(name, email, password, rememberMe = true) {
    const response = await httpClient.post("/auth/register", { name, email, password, rememberMe })

    if (!response.success) {
      throw createError(response, "Registration failed")
    }

    const verificationRequired = Boolean(response.data.verificationRequired)

    if (response.data.accessToken) {
      TokenManager.setAccessToken(response.data.accessToken, rememberMe)
      saveUser(response.data.user, rememberMe)
    } else {
      TokenManager.clearTokens()
      clearUser()
    }

    return {
      success: true,
      user: response.data.user,
      verificationRequired,
      emailDispatched: Boolean(response.data.emailDispatched),
      message: response.data.message,
    }
  },

  async logout() {
    await httpClient.post("/auth/logout", {})
    TokenManager.clearTokens()
    clearUser()
    return { success: true }
  },

  async getCurrentUser() {
    if (!TokenManager.getAccessToken()) {
      try {
        await httpClient.refreshAccessToken()
      } catch {
        TokenManager.clearTokens()
        clearUser()
        return null
      }
    }

    const response = await httpClient.get("/auth/me")

    if (!response.success) {
      TokenManager.clearTokens()
      clearUser()
      return null
    }

    saveUser(response.data)
    return response.data
  },

  async updateProfile(userData) {
    const response = await httpClient.put("/auth/profile", userData)

    if (!response.success) {
      throw createError(response, "Profile update failed")
    }

    saveUser(response.data)
    return {
      success: true,
      user: response.data,
    }
  },

  async changePassword(currentPassword, newPassword) {
    const response = await httpClient.put("/auth/change-password", {
      currentPassword,
      newPassword,
    })

    if (!response.success) {
      throw createError(response, "Password change failed")
    }

    return {
      success: true,
      message: response.data.message || "Password changed successfully",
    }
  },

  async requestPasswordReset(email) {
    const response = await httpClient.post("/auth/forgot-password", { email })

    if (!response.success) {
      throw createError(response, "Password recovery request failed")
    }

    return {
      success: true,
      message: response.data.message || "Password recovery email sent successfully",
    }
  },

  async resetPassword(token, password) {
    const response = await httpClient.post("/auth/reset-password", { token, password })

    if (!response.success) {
      throw createError(response, "Password reset failed")
    }

    TokenManager.clearTokens()
    clearUser()

    return {
      success: true,
      message: response.data.message || "Password updated successfully",
    }
  },

  async verifyEmail(token) {
    const response = await httpClient.post("/auth/verify-email", { token })

    if (!response.success) {
      throw createError(response, "Email verification failed")
    }

    return {
      success: true,
      user: response.data.user,
      message: response.data.message || "Email verified successfully",
    }
  },

  async resendVerificationEmail(email) {
    const response = await httpClient.post("/auth/resend-verification", { email })

    if (!response.success) {
      throw createError(response, "Verification email request failed")
    }

    return {
      success: true,
      alreadyVerified: Boolean(response.data.alreadyVerified),
      message: response.data.message || "Verification email sent successfully",
    }
  },

  isAuthenticated() {
    const accessToken = TokenManager.getAccessToken()
    return !!accessToken && !TokenManager.isTokenExpired(accessToken)
  },

  getSavedCredentials,
  getCurrentUserFromStorage: getStoredUser,
  validatePassword,
}

export const auth = AuthService
export default AuthService
