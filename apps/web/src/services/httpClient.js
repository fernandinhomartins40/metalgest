/**
 * HTTP Client for MetalGest API
 * Real implementation with token management and automatic refresh
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api';

// Token management
const TokenManager = {
  getAccessToken: () => localStorage.getItem('metalgest_access_token'),

  getRefreshToken: () => localStorage.getItem('metalgest_refresh_token'),

  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem('metalgest_access_token', accessToken);
    if (refreshToken) localStorage.setItem('metalgest_refresh_token', refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem('metalgest_access_token');
    localStorage.removeItem('metalgest_refresh_token');
    localStorage.removeItem('metalgest_user');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

// HTTP Client class
class HttpClient {
  constructor() {
    this.baseURL = API_URL;
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  onRefreshed(token) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  addRefreshSubscriber(callback) {
    this.refreshSubscribers.push(callback);
  }

  async refreshAccessToken() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      TokenManager.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let accessToken = TokenManager.getAccessToken();

    // Check if token is expired and refresh if needed
    if (accessToken && TokenManager.isTokenExpired(accessToken)) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          accessToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          this.onRefreshed(accessToken);
        } catch (error) {
          this.isRefreshing = false;
          throw error;
        }
      } else {
        // Wait for token refresh
        accessToken = await new Promise((resolve) => {
          this.addRefreshSubscriber((token) => {
            resolve(token);
          });
        });
      }
    }

    // Build headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Make request
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Try to refresh token once
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const newToken = await this.refreshAccessToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);

            // Retry original request with new token
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });

            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({ error: { message: 'Request failed' } }));
              return {
                success: false,
                data: null,
                error: errorData.error || { message: 'Request failed' },
              };
            }

            const data = await retryResponse.json();
            return {
              success: true,
              data,
              error: null,
            };
          } catch (error) {
            this.isRefreshing = false;
            TokenManager.clearTokens();
            window.location.href = '/login';
            throw error;
          }
        }
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
        return {
          success: false,
          data: null,
          error: errorData.error || { message: 'Request failed' },
        };
      }

      // Success response
      const data = await response.json();
      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      console.error('HTTP request error:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      };
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint, formData) {
    let accessToken = TokenManager.getAccessToken();

    const headers = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Upload failed' } }));
        return {
          success: false,
          data: null,
          error: errorData.error || { message: 'Upload failed' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: 'UPLOAD_ERROR',
          message: error.message || 'Upload error occurred',
        },
      };
    }
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
export { TokenManager };
export default httpClient;
