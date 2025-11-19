/**
 * API Service
 * Real implementation that communicates with the backend API
 */

import { httpClient } from './httpClient';

export const api = {
  // ==================== DASHBOARD APIs ====================
  dashboard: {
    getStats: async () => {
      const response = await httpClient.get('/dashboard/stats');
      return response.success ? response.data : null;
    },

    getRevenueChart: async (year) => {
      const response = await httpClient.get('/dashboard/revenue-chart', { year });
      return response.success ? response.data : null;
    },

    getQuotesConversion: async () => {
      const response = await httpClient.get('/dashboard/quotes-conversion');
      return response.success ? response.data : null;
    },

    getTopClients: async (limit = 10) => {
      const response = await httpClient.get('/dashboard/top-clients', { limit });
      return response.success ? response.data : [];
    },
  },

  // ==================== PRODUCTS APIs ====================
  products: {
    list: async (params = {}) => {
      const response = await httpClient.get('/products', params);
      return response.success ? response.data : { products: [], pagination: {} };
    },

    get: async (id) => {
      const response = await httpClient.get(`/products/${id}`);
      return response.success ? response.data : null;
    },

    create: async (productData) => {
      const response = await httpClient.post('/products', productData);
      return response;
    },

    update: async (id, productData) => {
      const response = await httpClient.put(`/products/${id}`, productData);
      return response;
    },

    delete: async (id) => {
      const response = await httpClient.delete(`/products/${id}`);
      return response;
    },

    updateStock: async (id, quantity, operation = 'set') => {
      const response = await httpClient.patch(`/products/${id}/stock`, { quantity, operation });
      return response;
    },

    getLowStock: async () => {
      const response = await httpClient.get('/products/low-stock');
      return response.success ? response.data : [];
    },

    getCategories: async () => {
      const response = await httpClient.get('/products/categories');
      return response.success ? response.data : [];
    },
  },

  // ==================== SERVICES APIs ====================
  services: {
    list: async (params = {}) => {
      const response = await httpClient.get('/services', params);
      return response.success ? response.data : { services: [], pagination: {} };
    },

    get: async (id) => {
      const response = await httpClient.get(`/services/${id}`);
      return response.success ? response.data : null;
    },

    create: async (serviceData) => {
      const response = await httpClient.post('/services', serviceData);
      return response;
    },

    update: async (id, serviceData) => {
      const response = await httpClient.put(`/services/${id}`, serviceData);
      return response;
    },

    delete: async (id) => {
      const response = await httpClient.delete(`/services/${id}`);
      return response;
    },

    getCategories: async () => {
      const response = await httpClient.get('/services/categories');
      return response.success ? response.data : [];
    },
  },

  // ==================== CLIENTS APIs ====================
  clients: {
    list: async (params = {}) => {
      const response = await httpClient.get('/clients', params);
      return response.success ? response.data : { clients: [], pagination: {} };
    },

    get: async (id) => {
      const response = await httpClient.get(`/clients/${id}`);
      return response.success ? response.data : null;
    },

    create: async (clientData) => {
      const response = await httpClient.post('/clients', clientData);
      return response;
    },

    update: async (id, clientData) => {
      const response = await httpClient.put(`/clients/${id}`, clientData);
      return response;
    },

    delete: async (id) => {
      const response = await httpClient.delete(`/clients/${id}`);
      return response;
    },

    getStats: async (id) => {
      const response = await httpClient.get(`/clients/${id}/stats`);
      return response.success ? response.data : null;
    },
  },

  // ==================== QUOTES APIs ====================
  quotes: {
    list: async (params = {}) => {
      const response = await httpClient.get('/quotes', params);
      return response.success ? response.data : { quotes: [], pagination: {} };
    },

    get: async (id) => {
      const response = await httpClient.get(`/quotes/${id}`);
      return response.success ? response.data : null;
    },

    getByPublicToken: async (token) => {
      const response = await httpClient.get(`/quotes/public/${token}`);
      return response.success ? response.data : null;
    },

    create: async (quoteData) => {
      const response = await httpClient.post('/quotes', quoteData);
      return response;
    },

    update: async (id, quoteData) => {
      const response = await httpClient.put(`/quotes/${id}`, quoteData);
      return response;
    },

    delete: async (id) => {
      const response = await httpClient.delete(`/quotes/${id}`);
      return response;
    },

    updateStatus: async (id, status) => {
      const response = await httpClient.patch(`/quotes/${id}/status`, { status });
      return response;
    },

    togglePublicLink: async (id, enabled) => {
      const response = await httpClient.patch(`/quotes/${id}/public-link`, { enabled });
      return response;
    },

    duplicate: async (id) => {
      const response = await httpClient.post(`/quotes/${id}/duplicate`);
      return response;
    },
  },

  // ==================== SERVICE ORDERS APIs ====================
  serviceOrders: {
    list: async (params = {}) => {
      const response = await httpClient.get('/service-orders', params);
      return response.success ? response.data : { orders: [], pagination: {} };
    },

    get: async (id) => {
      const response = await httpClient.get(`/service-orders/${id}`);
      return response.success ? response.data : null;
    },

    create: async (orderData) => {
      const response = await httpClient.post('/service-orders', orderData);
      return response;
    },

    update: async (id, orderData) => {
      const response = await httpClient.put(`/service-orders/${id}`, orderData);
      return response;
    },

    delete: async (id) => {
      const response = await httpClient.delete(`/service-orders/${id}`);
      return response;
    },

    updateStatus: async (id, status) => {
      const response = await httpClient.patch(`/service-orders/${id}/status`, { status });
      return response;
    },
  },

  // ==================== TRANSACTIONS APIs ====================
  transactions: {
    list: async (params = {}) => {
      const response = await httpClient.get('/transactions', params);
      return response.success ? response.data : { transactions: [], pagination: {} };
    },

    get: async (id) => {
      const response = await httpClient.get(`/transactions/${id}`);
      return response.success ? response.data : null;
    },

    create: async (transactionData) => {
      const response = await httpClient.post('/transactions', transactionData);
      return response;
    },

    update: async (id, transactionData) => {
      const response = await httpClient.put(`/transactions/${id}`, transactionData);
      return response;
    },

    delete: async (id) => {
      const response = await httpClient.delete(`/transactions/${id}`);
      return response;
    },

    getBalance: async (params = {}) => {
      const response = await httpClient.get('/transactions/balance', params);
      return response.success ? response.data : null;
    },

    getSummaryByCategory: async (params = {}) => {
      const response = await httpClient.get('/transactions/summary/category', params);
      return response.success ? response.data : [];
    },

    getSummaryByMonth: async (year) => {
      const response = await httpClient.get('/transactions/summary/month', { year });
      return response.success ? response.data : [];
    },
  },

  // ==================== USERS APIs ====================
  users: {
    list: async (params = {}) => {
      const response = await httpClient.get('/users', params);
      return response.success ? response.data : { users: [], pagination: {} };
    },

    get: async (id) => {
      const response = await httpClient.get(`/users/${id}`);
      return response.success ? response.data : null;
    },

    create: async (userData) => {
      const response = await httpClient.post('/users', userData);
      return response;
    },

    update: async (id, userData) => {
      const response = await httpClient.put(`/users/${id}`, userData);
      return response;
    },

    delete: async (id) => {
      const response = await httpClient.delete(`/users/${id}`);
      return response;
    },

    resetPassword: async (id, newPassword) => {
      const response = await httpClient.post(`/users/${id}/reset-password`, { newPassword });
      return response;
    },

    getStats: async (id) => {
      const response = await httpClient.get(`/users/${id}/stats`);
      return response.success ? response.data : null;
    },
  },

  // ==================== SETTINGS APIs ====================
  settings: {
    list: async () => {
      const response = await httpClient.get('/settings');
      return response.success ? response.data : {};
    },

    get: async (key) => {
      const response = await httpClient.get(`/settings/${key}`);
      return response.success ? response.data : null;
    },

    upsert: async (key, value) => {
      const response = await httpClient.put(`/settings/${key}`, { value });
      return response;
    },

    updateBulk: async (settings) => {
      const response = await httpClient.post('/settings/bulk', settings);
      return response;
    },

    delete: async (key) => {
      const response = await httpClient.delete(`/settings/${key}`);
      return response;
    },

    getCompany: async () => {
      const response = await httpClient.get('/settings/company');
      return response.success ? response.data : {};
    },

    updateCompany: async (companyData) => {
      const response = await httpClient.put('/settings/company', companyData);
      return response;
    },
  },
};

export default api;
