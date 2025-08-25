// Note: Toast import will be handled at call site to avoid context issues

// Base configuration
const API_BASE_URL = (() => {
  // Priority 1: Use environment variable if defined
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    // Add /api suffix if not present
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }
  
  // Priority 2: Auto-detect production environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If running on metalgest.com.br or www.metalgest.com.br
    if (hostname.includes('metalgest.com.br')) {
      return `https://metalgest.com.br/api`;
    }
    
    // If running on any other domain (not localhost)
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      return `${protocol}//${hostname}/api`;
    }
  }
  
  // Priority 3: Development fallback
  return 'http://localhost:3000/api';
})();

// Token management
const TokenManager = {
  getAccessToken: () => localStorage.getItem('metalgest_access_token'),
  
  getRefreshToken: () => localStorage.getItem('metalgest_refresh_token'),
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('metalgest_access_token', accessToken);
    localStorage.setItem('metalgest_refresh_token', refreshToken);
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
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  }
};

// HTTP Client class
class HttpClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  // Create request with default headers
  createRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.getAccessToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return {
      url,
      options: {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      },
    };
  }

  // Refresh token
  async refreshToken() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async performRefresh() {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to refresh token');
      }

      TokenManager.setTokens(
        result.data.token,
        refreshToken
      );

      return result.data.token;
    } catch (error) {
      TokenManager.clearTokens();
      // Redirect to login
      window.location.href = '/login';
      throw error;
    }
  }

  // Make request with automatic retry and token refresh
  async request(endpoint, options = {}) {
    let { url, options: requestOptions } = this.createRequest(endpoint, options);

    try {
      // First attempt
      let response = await fetch(url, requestOptions);
      
      // If token expired, try to refresh
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const token = TokenManager.getAccessToken();
        
        if (token && TokenManager.isTokenExpired(token)) {
          try {
            await this.refreshToken();
            
            // Retry with new token
            const retryRequest = this.createRequest(endpoint, options);
            response = await fetch(retryRequest.url, retryRequest.options);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            console.error('Token refresh failed:', refreshError);
            return response;
          }
        }
      }

      // Parse response
      const result = await response.json();

      // Handle errors
      if (!response.ok) {
        const error = new Error(result.error?.message || 'Request failed');
        error.status = response.status;
        error.data = result;
        throw error;
      }

      return result;
    } catch (fetchError) {
      // Handle network errors
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
        const networkError = new Error('Erro de conexão: Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      // Handle CORS errors
      if (fetchError.message.includes('CORS')) {
        const corsError = new Error('Erro CORS: Problema de configuração do servidor. Tente novamente ou contate o suporte.');
        corsError.status = 0;
        corsError.isCorsError = true;
        throw corsError;
      }
      
      // Re-throw other errors
      throw fetchError;
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
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

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // File upload
  async upload(endpoint, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const token = TokenManager.getAccessToken();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = function() {
        reject(new Error('Upload failed'));
      };

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  }
}

// Global error handler (without toast to avoid context issues)
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Handle specific error types
  if (error.status === 401) {
    TokenManager.clearTokens();
    window.location.href = '/login';
  }
  
  throw error;
};

// Create HTTP client instance
const httpClient = new HttpClient();

// Export API client with error handling
export const apiClient = {
  get: async (endpoint, params) => {
    try {
      return await httpClient.get(endpoint, params);
    } catch (error) {
      return handleApiError(error);
    }
  },

  post: async (endpoint, data) => {
    try {
      return await httpClient.post(endpoint, data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  put: async (endpoint, data) => {
    try {
      return await httpClient.put(endpoint, data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (endpoint) => {
    try {
      return await httpClient.delete(endpoint);
    } catch (error) {
      return handleApiError(error);
    }
  },

  upload: async (endpoint, file, onProgress) => {
    try {
      return await httpClient.upload(endpoint, file, onProgress);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Export token manager for auth service
export { TokenManager };

export default apiClient;