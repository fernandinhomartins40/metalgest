/**
 * Mock HTTP Client
 * Este é um cliente HTTP simulado que NÃO faz chamadas reais a nenhum backend.
 * Serve apenas para manter a estrutura do frontend intacta até a implementação do novo backend.
 */

// Token management (apenas local storage, sem validação real)
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

  isTokenExpired: () => {
    // Mock: nunca expira
    return false;
  }
};

// Mock HTTP Client class
class HttpClient {
  constructor() {
    console.warn('[MOCK MODE] HttpClient está operando em modo simulado. Nenhuma chamada real de API será feita.');
  }

  // Simula uma resposta de sucesso
  mockSuccess(data = null) {
    return Promise.resolve({
      success: true,
      data: data,
      error: null
    });
  }

  // Simula uma resposta de erro
  mockError(message = 'Operação não disponível') {
    return Promise.resolve({
      success: false,
      data: null,
      error: {
        message: message,
        code: 'MOCK_ERROR'
      }
    });
  }

  // HTTP Methods (todos retornam mock)
  async get(endpoint, params = {}) {
    console.log('[MOCK GET]', endpoint, params);
    return this.mockSuccess([]);
  }

  async post(endpoint, data = {}) {
    console.log('[MOCK POST]', endpoint, data);
    return this.mockSuccess({ id: Date.now().toString(), ...data });
  }

  async put(endpoint, data = {}) {
    console.log('[MOCK PUT]', endpoint, data);
    return this.mockSuccess({ id: Date.now().toString(), ...data });
  }

  async delete(endpoint) {
    console.log('[MOCK DELETE]', endpoint);
    return this.mockSuccess(true);
  }

  async patch(endpoint, data = {}) {
    console.log('[MOCK PATCH]', endpoint, data);
    return this.mockSuccess({ id: Date.now().toString(), ...data });
  }

  // File upload (mock)
  async upload(endpoint, file, onProgress = null) {
    console.log('[MOCK UPLOAD]', endpoint, file.name);

    // Simula progresso
    if (onProgress) {
      setTimeout(() => onProgress(50), 100);
      setTimeout(() => onProgress(100), 200);
    }

    return this.mockSuccess({
      url: URL.createObjectURL(file),
      filename: file.name,
      size: file.size
    });
  }
}

// Create HTTP client instance
const httpClient = new HttpClient();

// Export API client
export const apiClient = {
  get: async (endpoint, params) => httpClient.get(endpoint, params),
  post: async (endpoint, data) => httpClient.post(endpoint, data),
  put: async (endpoint, data) => httpClient.put(endpoint, data),
  delete: async (endpoint) => httpClient.delete(endpoint),
  patch: async (endpoint, data) => httpClient.patch(endpoint, data),
  upload: async (endpoint, file, onProgress) => httpClient.upload(endpoint, file, onProgress)
};

// Export token manager
export { TokenManager };

export default apiClient;
