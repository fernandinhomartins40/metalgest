/**
 * Mock Authentication Service
 * Este é um serviço de autenticação simulado que NÃO faz chamadas reais a nenhum backend.
 * Serve apenas para manter a estrutura do frontend intacta até a implementação do novo backend.
 */

import { TokenManager } from './httpClient';

// Storage keys
const STORAGE_KEYS = {
  USER: 'metalgest_user',
  ACCESS_TOKEN: 'metalgest_access_token',
  REFRESH_TOKEN: 'metalgest_refresh_token',
  CREDENTIALS: 'metalgest_credentials',
  PREFERENCES: 'metalgest_preferences',
};

// Mock user data
const createMockUser = (email, name = 'Usuário Demo') => ({
  id: Date.now().toString(),
  email,
  name,
  role: 'admin',
  active: true,
  emailVerified: true,
  plan: 'premium',
  subscription_status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Mock token
const createMockToken = () => {
  const payload = {
    sub: Date.now().toString(),
    exp: Date.now() / 1000 + 86400, // 24h from now
    iat: Date.now() / 1000
  };
  return btoa(JSON.stringify({ header: 'mock' })) + '.' +
         btoa(JSON.stringify(payload)) + '.' +
         btoa('signature');
};

// Encryption helper for remember me
const encryptData = (data) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

const decryptData = (encryptedData) => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export const auth = {
  // Login user (MOCK)
  login: async (email, password, rememberMe = false, keepConnected = false) => {
    console.log('[MOCK LOGIN]', email);

    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Cria usuário mock
    const user = createMockUser(email);
    const token = createMockToken();
    const refreshToken = createMockToken();

    // Store tokens
    TokenManager.setTokens(token, refreshToken);

    // Store user data
    const userData = {
      ...user,
      rememberMe,
      keepConnected,
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    // Store credentials if rememberMe is true
    if (rememberMe) {
      const encryptedCredentials = encryptData({ email, password });
      if (encryptedCredentials) {
        localStorage.setItem(STORAGE_KEYS.CREDENTIALS, encryptedCredentials);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    }

    return {
      user: userData,
      token,
      refreshToken,
      error: null,
    };
  },

  // Register user (MOCK)
  register: async (name, email, password) => {
    console.log('[MOCK REGISTER]', name, email);

    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Cria usuário mock
    const user = createMockUser(email, name);
    const token = createMockToken();
    const refreshToken = createMockToken();

    // Store tokens
    TokenManager.setTokens(token, refreshToken);

    // Store user data
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return {
      user,
      token,
      refreshToken,
      error: null,
    };
  },

  // Logout user (MOCK)
  logout: async () => {
    console.log('[MOCK LOGOUT]');

    // Clear all local storage except remembered credentials
    const credentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);

    TokenManager.clearTokens();
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);

    // Keep remembered credentials if they exist
    if (credentials) {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, credentials);
    }
  },

  // Get current user (MOCK)
  getCurrentUser: async () => {
    console.log('[MOCK GET CURRENT USER]');

    const token = TokenManager.getAccessToken();

    if (!token) {
      return null;
    }

    // Get user data from local storage
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },

  // Reset password (MOCK)
  resetPassword: async (email) => {
    console.log('[MOCK RESET PASSWORD]', email);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, error: null };
  },

  // Update password (MOCK)
  updatePassword: async (token, newPassword) => {
    console.log('[MOCK UPDATE PASSWORD]');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, error: null };
  },

  // Change password (MOCK)
  changePassword: async (currentPassword, newPassword) => {
    console.log('[MOCK CHANGE PASSWORD]');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, error: null };
  },

  // Update profile (MOCK)
  updateProfile: async (updateData) => {
    console.log('[MOCK UPDATE PROFILE]', updateData);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get current user
    const currentUser = auth.getStoredUser();
    if (!currentUser) {
      return { user: null, error: 'No user logged in' };
    }

    // Update user data
    const userData = {
      ...currentUser,
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Save updated user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return { user: userData, error: null };
  },

  // Get saved credentials
  getSavedCredentials: () => {
    try {
      const encryptedCredentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);

      if (encryptedCredentials) {
        return decryptData(encryptedCredentials);
      }

      return null;
    } catch (error) {
      console.error('Get saved credentials error:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = TokenManager.getAccessToken();
    return !!token;
  },

  // Get stored user data
  getStoredUser: () => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get stored user error:', error);
      return null;
    }
  },

  // Password validation
  validatePassword: (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSymbol]
      .filter(Boolean).length;

    return {
      isValid: hasMinLength && hasUpperCase && hasNumber && hasSymbol,
      strength: strength / 5,
      requirements: {
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSymbol,
      },
    };
  },
};

export default auth;
