import { httpClient, TokenManager } from "./httpClient"

const STORAGE_KEYS = {
  LOGIN_HINT: "metalgest_login_hint",
}

const AUTH_ERROR_MESSAGES = {
  ACCOUNT_INACTIVE: "Esta conta está inativa.",
  DUPLICATE_EMAIL: "Este e-mail já está cadastrado.",
  EMAIL_NOT_VERIFIED: "Seu cadastro ainda não foi confirmado. Enviamos um novo link para o seu e-mail.",
  EMAIL_SERVICE_UNAVAILABLE:
    "O serviço de e-mail está indisponível no momento. Tente novamente em instantes.",
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  INVALID_PASSWORD: "A senha atual informada não confere.",
  INVALID_PASSWORD_FORMAT:
    "Use ao menos 8 caracteres com maiúscula, minúscula, número e símbolo.",
  INVALID_TOKEN: "Este link é inválido ou expirou. Solicite um novo envio.",
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

const resolveMessage = (code, defaultMessage, overrideMessages = {}) => {
  return overrideMessages[code] || AUTH_ERROR_MESSAGES[code] || defaultMessage
}

const createError = (response, fallbackMessage, overrideMessages = {}) => {
  const code = response?.error?.code
  const error = new Error(
    resolveMessage(code, response?.error?.message || fallbackMessage, overrideMessages)
  )
  error.code = code
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
      throw createError(response, "Não foi possível entrar na conta.")
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
      throw createError(response, "Não foi possível concluir o cadastro.")
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
      message: verificationRequired
        ? response.data.emailDispatched
          ? "Conta criada. Enviamos um link para confirmar o seu e-mail."
          : "Conta criada, mas não foi possível enviar o e-mail de confirmação."
        : "Conta criada com sucesso.",
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
      throw createError(response, "Não foi possível atualizar o perfil.")
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
      throw createError(response, "Não foi possível alterar a senha.")
    }

    return {
      success: true,
      message: response.data.message || "Senha alterada com sucesso.",
    }
  },

  async requestPasswordReset(email) {
    const response = await httpClient.post("/auth/forgot-password", { email })

    if (!response.success) {
      throw createError(response, "Não foi possível solicitar a recuperação de senha.")
    }

    const recoveryAvailable = response.data.recoveryAvailable !== false
    const message = recoveryAvailable
      ? "Se o e-mail existir, um link de recuperação foi enviado."
      : "A recuperação por e-mail está temporariamente indisponível. Entre em contato com o suporte."

    return {
      success: true,
      recoveryAvailable,
      emailDispatched: Boolean(response.data.emailDispatched),
      message,
    }
  },

  async resetPassword(token, password) {
    const response = await httpClient.post("/auth/reset-password", { token, password })

    if (!response.success) {
      throw createError(response, "Não foi possível redefinir a senha.")
    }

    TokenManager.clearTokens()
    clearUser()

    return {
      success: true,
      message: "Sua senha foi atualizada com sucesso.",
    }
  },

  async verifyEmail(token) {
    const response = await httpClient.post("/auth/verify-email", { token })

    if (!response.success) {
      throw createError(response, "Não foi possível confirmar o e-mail.")
    }

    return {
      success: true,
      user: response.data.user,
      message: "E-mail confirmado com sucesso. Agora você já pode entrar na plataforma.",
    }
  },

  async resendVerificationEmail(email) {
    const response = await httpClient.post("/auth/resend-verification", { email })

    if (!response.success) {
      throw createError(response, "Não foi possível reenviar a confirmação.")
    }

    return {
      success: true,
      alreadyVerified: Boolean(response.data.alreadyVerified),
      message: response.data.alreadyVerified
        ? "Este e-mail já está confirmado. Entre normalmente com a sua conta."
        : "Reenviamos um novo link de confirmação para o seu e-mail.",
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
