import { apiClient, TokenManager } from './httpClient';
import { toast } from "../components/ui/use-toast";

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

export const auth = {
  // Login user
  login: async (email, password, rememberMe = false, keepConnected = false) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        rememberMe,
        keepConnected,
      });

      if (response.success) {
        const { user, tokens } = response.data;
        
        // Store tokens
        TokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
        
        // Store user data
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active,
          emailVerified: user.emailVerified,
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
          tokens,
          error: null,
        };
      }
      
      throw new Error(response.error?.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      return {
        user: null,
        tokens: null,
        error: error.message || 'Login failed',
      };
    }
  },

  // Register user
  register: async (name, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });

      if (response.success) {
        const { user, tokens } = response.data;
        
        // Store tokens
        TokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
        
        // Store user data
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active,
          emailVerified: user.emailVerified,
        };
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        return {
          user: userData,
          tokens,
          error: null,
        };
      }
      
      throw new Error(response.error?.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      return {
        user: null,
        tokens: null,
        error: error.message || 'Registration failed',
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all local storage except remembered credentials
      const credentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      
      TokenManager.clearTokens();
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      
      // Keep remembered credentials if they exist
      if (credentials) {
        localStorage.setItem(STORAGE_KEYS.CREDENTIALS, credentials);
      }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = TokenManager.getAccessToken();
      
      if (!token) {
        return null;
      }
      
      // Check if token is expired
      if (TokenManager.isTokenExpired(token)) {
        // Try to refresh token
        try {
          const refreshToken = TokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await apiClient.post('/auth/refresh-token', {
              refreshToken,
            });
            
            if (response.success) {
              TokenManager.setTokens(
                response.data.tokens.accessToken,
                response.data.tokens.refreshToken
              );
            }
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          TokenManager.clearTokens();
          return null;
        }
      }
      
      // Get user data from API
      const response = await apiClient.get('/auth/me');
      
      if (response.success) {
        const userData = response.data;
        
        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      TokenManager.clearTokens();
      return null;
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/request-password-reset', {
        email,
      });

      if (response.success) {
        toast({
          title: "Email enviado",
          description: "Verifique seu email para redefinir a senha.",
        });
        return { success: true, error: null };
      }
      
      throw new Error(response.error?.message || 'Password reset failed');
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  },

  // Update password
  updatePassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
      });

      if (response.success) {
        toast({
          title: "Senha atualizada",
          description: "Sua senha foi redefinida com sucesso.",
        });
        return { success: true, error: null };
      }
      
      throw new Error(response.error?.message || 'Password update failed');
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        error: error.message || 'Password update failed',
      };
    }
  },

  // Change password (authenticated user)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso.",
        });
        return { success: true, error: null };
      }
      
      throw new Error(response.error?.message || 'Password change failed');
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.message || 'Password change failed',
      };
    }
  },

  // Update profile
  updateProfile: async (updateData) => {
    try {
      const response = await apiClient.put('/auth/profile', updateData);

      if (response.success) {
        const userData = response.data;
        
        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        });
        
        return { user: userData, error: null };
      }
      
      throw new Error(response.error?.message || 'Profile update failed');
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        user: null,
        error: error.message || 'Profile update failed',
      };
    }
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
    return token && !TokenManager.isTokenExpired(token);
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