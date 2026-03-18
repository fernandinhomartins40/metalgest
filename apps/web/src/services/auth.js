import { httpClient, TokenManager } from "./httpClient"

const STORAGE_KEYS = {
  USER: "metalgest_user",
  LOGIN_HINT: "metalgest_login_hint",
}

const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

const getStoredUser = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.USER)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const clearUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER)
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
    const response = await httpClient.post("/auth/login", { email, password })

    if (!response.success) {
      throw createError(response, "Login failed")
    }

    TokenManager.setAccessToken(response.data.accessToken)
    saveUser(response.data.user)

    if (rememberMe) {
      saveLoginHint(email)
    } else {
      clearLoginHint()
    }

    return {
      success: true,
      user: response.data.user,
    }
  },

  async register(name, email, password) {
    const response = await httpClient.post("/auth/register", { name, email, password })

    if (!response.success) {
      throw createError(response, "Registration failed")
    }

    TokenManager.setAccessToken(response.data.accessToken)
    saveUser(response.data.user)

    return {
      success: true,
      user: response.data.user,
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

  async requestPasswordReset() {
    throw new Error("Fluxo de recuperação de senha não configurado nesta instalação.")
  },

  async resetPassword() {
    throw new Error("Fluxo de recuperação de senha não configurado nesta instalação.")
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
