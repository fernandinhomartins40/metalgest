import { apiClient } from '../services/httpClient';

// Audit helper functions
export const audit = {
  log: async ({ action, module, details }) => {
    try {
      // Only log if user is authenticated
      const token = localStorage.getItem('metalgest_access_token');
      if (!token) {
        return;
      }

      // Get additional context
      const auditData = {
        action,
        module,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      };

      // Send to backend (fire and forget)
      await apiClient.post('/audit/log', auditData);
    } catch (error) {
      // Don't throw errors for audit logging
      console.warn('Audit logging failed:', error);
    }
  },

  // Convenience methods for common actions
  create: (module, details) => audit.log({ action: 'create', module, details }),
  read: (module, details) => audit.log({ action: 'read', module, details }),
  update: (module, details) => audit.log({ action: 'update', module, details }),
  delete: (module, details) => audit.log({ action: 'delete', module, details }),
  list: (module, details) => audit.log({ action: 'list', module, details }),
  search: (module, details) => audit.log({ action: 'search', module, details }),
  
  // Authentication actions
  login: (details) => audit.log({ action: 'login', module: 'auth', details }),
  logout: (details) => audit.log({ action: 'logout', module: 'auth', details }),
  register: (details) => audit.log({ action: 'register', module: 'auth', details }),

  // Custom actions
  custom: (action, module, details) => audit.log({ action, module, details }),
};

export default audit;