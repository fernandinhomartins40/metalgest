const API_URL = import.meta.env.VITE_API_URL || "/api"

class HttpError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = "HttpError"
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}

const TokenManager = {
  getAccessToken: () => localStorage.getItem("metalgest_access_token"),

  setAccessToken: (accessToken) => {
    if (accessToken) {
      localStorage.setItem("metalgest_access_token", accessToken)
    }
  },

  clearTokens: () => {
    localStorage.removeItem("metalgest_access_token")
    localStorage.removeItem("metalgest_user")
  },

  isTokenExpired: (token) => {
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp * 1000 <= Date.now()
    } catch {
      return true
    }
  },
}

class HttpClient {
  constructor() {
    this.baseURL = API_URL
    this.isRefreshing = false
    this.refreshPromise = null
  }

  async parseResponse(response) {
    const text = await response.text()
    if (!text) {
      return null
    }

    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  async refreshAccessToken() {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then(async (response) => {
        const payload = await this.parseResponse(response)

        if (!response.ok || !payload?.accessToken) {
          throw new HttpError(payload?.error?.message || "Failed to refresh token", {
            status: response.status,
            code: payload?.error?.code,
            details: payload?.error?.details,
          })
        }

        TokenManager.setAccessToken(payload.accessToken)
        return payload.accessToken
      })
      .finally(() => {
        this.isRefreshing = false
        this.refreshPromise = null
      })

    return this.refreshPromise
  }

  async request(endpoint, options = {}, retry = true) {
    const url = `${this.baseURL}${endpoint}`
    let accessToken = TokenManager.getAccessToken()

    if (accessToken && TokenManager.isTokenExpired(accessToken)) {
      try {
        accessToken = await this.refreshAccessToken()
      } catch (error) {
        TokenManager.clearTokens()
        return {
          success: false,
          data: null,
          error: {
            code: error.code || "TOKEN_REFRESH_FAILED",
            message: error.message || "Authentication expired",
            details: error.details,
            status: error.status || 401,
          },
        }
      }
    }

    const headers = {
      ...options.headers,
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json"
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      })

      const payload = await this.parseResponse(response)

      if (response.status === 401 && retry) {
        try {
          const refreshedToken = await this.refreshAccessToken()
          return this.request(
            endpoint,
            {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${refreshedToken}`,
              },
            },
            false
          )
        } catch {
          TokenManager.clearTokens()
        }
      }

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: {
            code: payload?.error?.code || "REQUEST_FAILED",
            message: payload?.error?.message || "Request failed",
            details: payload?.error?.details,
            status: response.status,
          },
        }
      }

      return {
        success: true,
        data: payload,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred",
          status: 0,
        },
      }
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = String(value)
        }

        return acc
      }, {})
    ).toString()

    return this.request(query ? `${endpoint}?${query}` : endpoint, { method: "GET" })
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }

  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: "POST",
      body: formData,
      headers: {},
    })
  }
}

export const httpClient = new HttpClient()
export { HttpError, TokenManager }
export default httpClient
