/**
 * Authentication Service
 * Real implementation that communicates with the backend API
 */

import { httpClient, TokenManager } from './httpClient';

// Storage keys
const STORAGE_KEYS = {
  USER: 'metalgest_user',
  ACCESS_TOKEN: 'metalgest_access_token',
  REFRESH_TOKEN: 'metalgest_refresh_token',
  CREDENTIALS: 'metalgest_credentials',
  PREFERENCES: 'metalgest_preferences',
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

// Save user to storage
const saveUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Get current user from storage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Save credentials for remember me
const saveCredentials = (email, password) => {
  const encrypted = encryptData({ email, password });
  if (encrypted) {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, encrypted);
  }
};

// Get saved credentials
const getSavedCredentials = () => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  return encrypted ? decryptData(encrypted) : null;
};

// Clear saved credentials
const clearCredentials = () => {
  localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
};

// Authentication Service
export const AuthService = {
  /**
   * Login with email and password
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await httpClient.post('/auth/login', {
        email,
        password,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Login failed',
        };
      }

      // Save tokens
      TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);

      // Save user
      saveUser(response.data.user);

      // Handle remember me
      if (rememberMe) {
        saveCredentials(email, password);
      } else {
        clearCredentials();
      }

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  /**
   * Register new user
   */
  async register(name, email, password) {
    try {
      const response = await httpClient.post('/auth/register', {
        name,
        email,
        password,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Registration failed',
        };
      }

      // Save tokens
      TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);

      // Save user
      saveUser(response.data.user);

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  },

  /**
   * Logout
   */
  async logout() {
    try {
      // Call logout endpoint to invalidate refresh token
      await httpClient.post('/auth/logout');

      // Clear local storage
      TokenManager.clearTokens();
      clearCredentials();

      return {
        success: true,
      };
    } catch (error) {
      // Even if API call fails, clear local data
      TokenManager.clearTokens();
      clearCredentials();

      return {
        success: true,
      };
    }
  },

  /**
   * Get current user from API
   */
  async getCurrentUser() {
    try {
      const response = await httpClient.get('/auth/me');

      if (!response.success) {
        return {
          success: false,
          user: null,
        };
      }

      // Update stored user
      saveUser(response.data);

      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        user: null,
      };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    try {
      const response = await httpClient.put('/auth/profile', userData);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Profile update failed',
        };
      }

      // Update stored user
      saveUser(response.data);

      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Profile update failed',
      };
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await httpClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Password change failed',
        };
      }

      return {
        success: true,
        message: response.data.message || 'Password changed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password change failed',
      };
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const response = await httpClient.post('/auth/forgot-password', {
        email,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Password reset request failed',
        };
      }

      return {
        success: true,
        message: response.data.message || 'Password reset email sent',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password reset request failed',
      };
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await httpClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Password reset failed',
        };
      }

      return {
        success: true,
        message: response.data.message || 'Password reset successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const accessToken = TokenManager.getAccessToken();
    return !!accessToken && !TokenManager.isTokenExpired(accessToken);
  },

  /**
   * Get saved credentials
   */
  getSavedCredentials,

  /**
   * Get current user from storage (without API call)
   */
  getCurrentUserFromStorage: getCurrentUser,
};

export default AuthService;
