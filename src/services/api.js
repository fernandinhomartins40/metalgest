import { apiClient } from './httpClient';
import { audit } from './audit';

export const api = {
  // Dashboard APIs
  dashboard: {
    getStats: async () => {
      const response = await apiClient.get('/dashboard/stats');
      
      if (response.success) {
        await audit.log({
          action: 'get_stats',
          module: 'dashboard',
          details: { stats: response.data },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get dashboard stats');
    },

    getCharts: async () => {
      const response = await apiClient.get('/dashboard/charts');
      
      if (response.success) {
        await audit.log({
          action: 'get_charts',
          module: 'dashboard',
          details: { charts: response.data },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get dashboard charts');
    },

    getRecentQuotes: async (limit = 5) => {
      const response = await apiClient.get('/dashboard/recent-quotes', { limit });
      
      if (response.success) {
        await audit.log({
          action: 'get_recent_quotes',
          module: 'dashboard',
          details: { count: response.data.length },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get recent quotes');
    },

    getPerformance: async () => {
      const response = await apiClient.get('/dashboard/performance');
      
      if (response.success) {
        await audit.log({
          action: 'get_performance',
          module: 'dashboard',
          details: { performance: response.data },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get performance data');
    },
  },

  // Products APIs
  products: {
    list: async (params = {}) => {
      const response = await apiClient.get('/products', params);
      
      if (response.success) {
        await audit.log({
          action: 'list',
          module: 'products',
          details: { count: response.data.data?.length || 0, params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to list products');
    },

    create: async (productData) => {
      const response = await apiClient.post('/products', productData);
      
      if (response.success) {
        await audit.log({
          action: 'create',
          module: 'products',
          details: { productId: response.data.id, name: response.data.name },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create product');
    },

    get: async (id) => {
      const response = await apiClient.get(`/products/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'get',
          module: 'products',
          details: { productId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get product');
    },

    update: async (id, productData) => {
      const response = await apiClient.put(`/products/${id}`, productData);
      
      if (response.success) {
        await audit.log({
          action: 'update',
          module: 'products',
          details: { productId: id, changes: productData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update product');
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/products/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'delete',
          module: 'products',
          details: { productId: id },
        });
        return true;
      }
      
      throw new Error(response.error?.message || 'Failed to delete product');
    },

    search: async (params = {}) => {
      const response = await apiClient.get('/products/search', params);
      
      if (response.success) {
        await audit.log({
          action: 'search',
          module: 'products',
          details: { params, count: response.data.length },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to search products');
    },
  },

  // Services APIs
  services: {
    list: async (params = {}) => {
      const response = await apiClient.get('/services', params);
      
      if (response.success) {
        await audit.log({
          action: 'list',
          module: 'services',
          details: { count: response.data.data?.length || 0, params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to list services');
    },

    create: async (serviceData) => {
      const response = await apiClient.post('/services', serviceData);
      
      if (response.success) {
        await audit.log({
          action: 'create',
          module: 'services',
          details: { serviceId: response.data.id, name: response.data.name },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create service');
    },

    get: async (id) => {
      const response = await apiClient.get(`/services/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'get',
          module: 'services',
          details: { serviceId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get service');
    },

    update: async (id, serviceData) => {
      const response = await apiClient.put(`/services/${id}`, serviceData);
      
      if (response.success) {
        await audit.log({
          action: 'update',
          module: 'services',
          details: { serviceId: id, changes: serviceData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update service');
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/services/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'delete',
          module: 'services',
          details: { serviceId: id },
        });
        return true;
      }
      
      throw new Error(response.error?.message || 'Failed to delete service');
    },

    search: async (params = {}) => {
      const response = await apiClient.get('/services/search', params);
      
      if (response.success) {
        await audit.log({
          action: 'search',
          module: 'services',
          details: { params, count: response.data.length },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to search services');
    },
  },

  // Clients APIs
  clients: {
    list: async (params = {}) => {
      const response = await apiClient.get('/clients', params);
      
      if (response.success) {
        await audit.log({
          action: 'list',
          module: 'clients',
          details: { count: response.data.data?.length || 0, params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to list clients');
    },

    create: async (clientData) => {
      const response = await apiClient.post('/clients', clientData);
      
      if (response.success) {
        await audit.log({
          action: 'create',
          module: 'clients',
          details: { clientId: response.data.id, name: response.data.name },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create client');
    },

    get: async (id) => {
      const response = await apiClient.get(`/clients/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'get',
          module: 'clients',
          details: { clientId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get client');
    },

    update: async (id, clientData) => {
      const response = await apiClient.put(`/clients/${id}`, clientData);
      
      if (response.success) {
        await audit.log({
          action: 'update',
          module: 'clients',
          details: { clientId: id, changes: clientData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update client');
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/clients/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'delete',
          module: 'clients',
          details: { clientId: id },
        });
        return true;
      }
      
      throw new Error(response.error?.message || 'Failed to delete client');
    },

    search: async (params = {}) => {
      const response = await apiClient.get('/clients/search', params);
      
      if (response.success) {
        await audit.log({
          action: 'search',
          module: 'clients',
          details: { params, count: response.data.length },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to search clients');
    },
  },

  // Quotes APIs
  quotes: {
    list: async (params = {}) => {
      const response = await apiClient.get('/quotes', params);
      
      if (response.success) {
        await audit.log({
          action: 'list',
          module: 'quotes',
          details: { count: response.data.data?.length || 0, params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to list quotes');
    },

    create: async (quoteData) => {
      const response = await apiClient.post('/quotes', quoteData);
      
      if (response.success) {
        await audit.log({
          action: 'create',
          module: 'quotes',
          details: { quoteId: response.data.id, clientId: response.data.clientId },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create quote');
    },

    get: async (id) => {
      const response = await apiClient.get(`/quotes/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'get',
          module: 'quotes',
          details: { quoteId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get quote');
    },

    update: async (id, quoteData) => {
      const response = await apiClient.put(`/quotes/${id}`, quoteData);
      
      if (response.success) {
        await audit.log({
          action: 'update',
          module: 'quotes',
          details: { quoteId: id, changes: quoteData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update quote');
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/quotes/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'delete',
          module: 'quotes',
          details: { quoteId: id },
        });
        return true;
      }
      
      throw new Error(response.error?.message || 'Failed to delete quote');
    },

    duplicate: async (id) => {
      const response = await apiClient.post(`/quotes/${id}/duplicate`);
      
      if (response.success) {
        await audit.log({
          action: 'duplicate',
          module: 'quotes',
          details: { originalQuoteId: id, newQuoteId: response.data.id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to duplicate quote');
    },

    generatePublicLink: async (id) => {
      const response = await apiClient.post(`/quotes/${id}/public-link`);
      
      if (response.success) {
        await audit.log({
          action: 'generate_public_link',
          module: 'quotes',
          details: { quoteId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to generate public link');
    },

    getPublicQuote: async (token) => {
      const response = await apiClient.get(`/quotes/public/${token}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get public quote');
    },

    updatePublicQuoteResponse: async (token, responseData) => {
      const response = await apiClient.put(`/quotes/public/${token}/response`, responseData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update quote response');
    },

    generatePDF: async (id) => {
      const response = await apiClient.post(`/quotes/${id}/pdf`);
      
      if (response.success) {
        await audit.log({
          action: 'generate_pdf',
          module: 'quotes',
          details: { quoteId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to generate PDF');
    },
  },

  // Service Orders APIs
  serviceOrders: {
    list: async (params = {}) => {
      const response = await apiClient.get('/service-orders', params);
      
      if (response.success) {
        await audit.log({
          action: 'list',
          module: 'service_orders',
          details: { count: response.data.data?.length || 0, params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to list service orders');
    },

    create: async (serviceOrderData) => {
      const response = await apiClient.post('/service-orders', serviceOrderData);
      
      if (response.success) {
        await audit.log({
          action: 'create',
          module: 'service_orders',
          details: { serviceOrderId: response.data.id, quoteId: response.data.quoteId },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create service order');
    },

    get: async (id) => {
      const response = await apiClient.get(`/service-orders/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'get',
          module: 'service_orders',
          details: { serviceOrderId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get service order');
    },

    update: async (id, serviceOrderData) => {
      const response = await apiClient.put(`/service-orders/${id}`, serviceOrderData);
      
      if (response.success) {
        await audit.log({
          action: 'update',
          module: 'service_orders',
          details: { serviceOrderId: id, changes: serviceOrderData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update service order');
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/service-orders/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'delete',
          module: 'service_orders',
          details: { serviceOrderId: id },
        });
        return true;
      }
      
      throw new Error(response.error?.message || 'Failed to delete service order');
    },

    updateStatus: async (id, status) => {
      const response = await apiClient.put(`/service-orders/${id}/status`, { status });
      
      if (response.success) {
        await audit.log({
          action: 'update_status',
          module: 'service_orders',
          details: { serviceOrderId: id, status },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update service order status');
    },

    createFromQuote: async (quoteId, serviceOrderData) => {
      const response = await apiClient.post(`/service-orders/from-quote/${quoteId}`, serviceOrderData);
      
      if (response.success) {
        await audit.log({
          action: 'create_from_quote',
          module: 'service_orders',
          details: { quoteId, serviceOrderId: response.data.id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create service order from quote');
    },
  },

  // Transactions APIs
  transactions: {
    list: async (params = {}) => {
      const response = await apiClient.get('/transactions', params);
      
      if (response.success) {
        await audit.log({
          action: 'list',
          module: 'transactions',
          details: { count: response.data.data?.length || 0, params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to list transactions');
    },

    create: async (transactionData) => {
      const response = await apiClient.post('/transactions', transactionData);
      
      if (response.success) {
        await audit.log({
          action: 'create',
          module: 'transactions',
          details: { transactionId: response.data.id, type: response.data.type, value: response.data.value },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create transaction');
    },

    get: async (id) => {
      const response = await apiClient.get(`/transactions/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'get',
          module: 'transactions',
          details: { transactionId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get transaction');
    },

    update: async (id, transactionData) => {
      const response = await apiClient.put(`/transactions/${id}`, transactionData);
      
      if (response.success) {
        await audit.log({
          action: 'update',
          module: 'transactions',
          details: { transactionId: id, changes: transactionData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update transaction');
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/transactions/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'delete',
          module: 'transactions',
          details: { transactionId: id },
        });
        return true;
      }
      
      throw new Error(response.error?.message || 'Failed to delete transaction');
    },

    getSummary: async (params = {}) => {
      const response = await apiClient.get('/transactions/summary', params);
      
      if (response.success) {
        await audit.log({
          action: 'get_summary',
          module: 'transactions',
          details: { params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get transaction summary');
    },

    getBalance: async (params = {}) => {
      const response = await apiClient.get('/transactions/balance', params);
      
      if (response.success) {
        await audit.log({
          action: 'get_balance',
          module: 'transactions',
          details: { params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get balance');
    },
  },

  // Settings APIs
  settings: {
    getCompany: async () => {
      const response = await apiClient.get('/settings/company');
      
      if (response.success) {
        await audit.log({
          action: 'get_company_settings',
          module: 'settings',
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get company settings');
    },

    updateCompany: async (settingsData) => {
      const response = await apiClient.put('/settings/company', settingsData);
      
      if (response.success) {
        await audit.log({
          action: 'update_company_settings',
          module: 'settings',
          details: { changes: settingsData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update company settings');
    },

    getSystem: async () => {
      const response = await apiClient.get('/settings/system');
      
      if (response.success) {
        await audit.log({
          action: 'get_system_settings',
          module: 'settings',
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get system settings');
    },

    updateSystem: async (settingsData) => {
      const response = await apiClient.put('/settings/system', settingsData);
      
      if (response.success) {
        await audit.log({
          action: 'update_system_settings',
          module: 'settings',
          details: { changes: settingsData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update system settings');
    },

    getNotifications: async () => {
      const response = await apiClient.get('/settings/notifications');
      
      if (response.success) {
        await audit.log({
          action: 'get_notification_settings',
          module: 'settings',
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get notification settings');
    },

    updateNotifications: async (settingsData) => {
      const response = await apiClient.put('/settings/notifications', settingsData);
      
      if (response.success) {
        await audit.log({
          action: 'update_notification_settings',
          module: 'settings',
          details: { changes: settingsData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update notification settings');
    },
  },

  // Users APIs (Admin only)
  users: {
    list: async (params = {}) => {
      const response = await apiClient.get('/users', params);
      
      if (response.success) {
        await audit.log({
          action: 'list',
          module: 'users',
          details: { count: response.data.data?.length || 0, params },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to list users');
    },

    create: async (userData) => {
      const response = await apiClient.post('/users', userData);
      
      if (response.success) {
        await audit.log({
          action: 'create',
          module: 'users',
          details: { userId: response.data.id, email: response.data.email },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to create user');
    },

    get: async (id) => {
      const response = await apiClient.get(`/users/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'get',
          module: 'users',
          details: { userId: id },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to get user');
    },

    update: async (id, userData) => {
      const response = await apiClient.put(`/users/${id}`, userData);
      
      if (response.success) {
        await audit.log({
          action: 'update',
          module: 'users',
          details: { userId: id, changes: userData },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to update user');
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/users/${id}`);
      
      if (response.success) {
        await audit.log({
          action: 'delete',
          module: 'users',
          details: { userId: id },
        });
        return true;
      }
      
      throw new Error(response.error?.message || 'Failed to delete user');
    },
  },

  // File upload
  upload: {
    logo: async (file, onProgress) => {
      const response = await apiClient.upload('/upload/logo', file, onProgress);
      
      if (response.success) {
        await audit.log({
          action: 'upload_logo',
          module: 'upload',
          details: { fileName: file.name, fileSize: file.size },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to upload logo');
    },

    document: async (file, onProgress) => {
      const response = await apiClient.upload('/upload/documents', file, onProgress);
      
      if (response.success) {
        await audit.log({
          action: 'upload_document',
          module: 'upload',
          details: { fileName: file.name, fileSize: file.size },
        });
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to upload document');
    },
  },
};

export default api;