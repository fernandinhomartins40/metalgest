/**
 * Mock API Service
 * Este é um serviço de API simulado que NÃO faz chamadas reais a nenhum backend.
 * Serve apenas para manter a estrutura do frontend intacta até a implementação do novo backend.
 *
 * IMPORTANTE: Todas as funções retornam dados simulados (mock).
 */

import { apiClient } from './httpClient';

// Helper para simular delay de rede
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 300));

// Helper para log de auditoria mock
const mockAudit = (action, module, details = {}) => {
  console.log(`[MOCK AUDIT] ${module}.${action}`, details);
};

export const api = {
  // ==================== DASHBOARD APIs ====================
  dashboard: {
    getStats: async () => {
      await mockDelay();
      mockAudit('get_stats', 'dashboard');
      return {
        totalClients: 0,
        totalQuotes: 0,
        totalRevenue: 0,
        pendingOrders: 0
      };
    },

    getCharts: async () => {
      await mockDelay();
      mockAudit('get_charts', 'dashboard');
      return {
        revenue: [],
        quotes: [],
        orders: []
      };
    },

    getRecentQuotes: async (limit = 5) => {
      await mockDelay();
      mockAudit('get_recent_quotes', 'dashboard', { limit });
      return [];
    },

    getPerformance: async () => {
      await mockDelay();
      mockAudit('get_performance', 'dashboard');
      return {
        quotesAccepted: 0,
        quotesRejected: 0,
        averageValue: 0
      };
    },
  },

  // ==================== PRODUCTS APIs ====================
  products: {
    list: async (params = {}) => {
      await mockDelay();
      mockAudit('list', 'products', { params });
      return { data: [], total: 0, page: 1, limit: 10 };
    },

    create: async (productData) => {
      await mockDelay();
      mockAudit('create', 'products', { productData });
      return { id: Date.now().toString(), ...productData };
    },

    get: async (id) => {
      await mockDelay();
      mockAudit('get', 'products', { id });
      return null;
    },

    update: async (id, productData) => {
      await mockDelay();
      mockAudit('update', 'products', { id, productData });
      return { id, ...productData };
    },

    delete: async (id) => {
      await mockDelay();
      mockAudit('delete', 'products', { id });
      return true;
    },

    search: async (params = {}) => {
      await mockDelay();
      mockAudit('search', 'products', { params });
      return [];
    },
  },

  // ==================== SERVICES APIs ====================
  services: {
    list: async (params = {}) => {
      await mockDelay();
      mockAudit('list', 'services', { params });
      return { data: [], total: 0, page: 1, limit: 10 };
    },

    create: async (serviceData) => {
      await mockDelay();
      mockAudit('create', 'services', { serviceData });
      return { id: Date.now().toString(), ...serviceData };
    },

    get: async (id) => {
      await mockDelay();
      mockAudit('get', 'services', { id });
      return null;
    },

    update: async (id, serviceData) => {
      await mockDelay();
      mockAudit('update', 'services', { id, serviceData });
      return { id, ...serviceData };
    },

    delete: async (id) => {
      await mockDelay();
      mockAudit('delete', 'services', { id });
      return true;
    },

    search: async (params = {}) => {
      await mockDelay();
      mockAudit('search', 'services', { params });
      return [];
    },
  },

  // ==================== CLIENTS APIs ====================
  clients: {
    list: async (params = {}) => {
      await mockDelay();
      mockAudit('list', 'clients', { params });
      return { data: [], total: 0, page: 1, limit: 10 };
    },

    create: async (clientData) => {
      await mockDelay();
      mockAudit('create', 'clients', { clientData });
      return { id: Date.now().toString(), ...clientData };
    },

    get: async (id) => {
      await mockDelay();
      mockAudit('get', 'clients', { id });
      return null;
    },

    update: async (id, clientData) => {
      await mockDelay();
      mockAudit('update', 'clients', { id, clientData });
      return { id, ...clientData };
    },

    delete: async (id) => {
      await mockDelay();
      mockAudit('delete', 'clients', { id });
      return true;
    },

    search: async (params = {}) => {
      await mockDelay();
      mockAudit('search', 'clients', { params });
      return [];
    },
  },

  // ==================== QUOTES APIs ====================
  quotes: {
    list: async (params = {}) => {
      await mockDelay();
      mockAudit('list', 'quotes', { params });
      return { data: [], total: 0, page: 1, limit: 10 };
    },

    create: async (quoteData) => {
      await mockDelay();
      mockAudit('create', 'quotes', { quoteData });
      return { id: Date.now().toString(), ...quoteData };
    },

    get: async (id) => {
      await mockDelay();
      mockAudit('get', 'quotes', { id });
      return null;
    },

    update: async (id, quoteData) => {
      await mockDelay();
      mockAudit('update', 'quotes', { id, quoteData });
      return { id, ...quoteData };
    },

    delete: async (id) => {
      await mockDelay();
      mockAudit('delete', 'quotes', { id });
      return true;
    },

    duplicate: async (id) => {
      await mockDelay();
      mockAudit('duplicate', 'quotes', { id });
      return { id: Date.now().toString(), originalId: id };
    },

    generatePublicLink: async (id) => {
      await mockDelay();
      mockAudit('generate_public_link', 'quotes', { id });
      return {
        publicToken: 'mock-token-' + Date.now(),
        publicUrl: window.location.origin + '/quote/mock-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    },

    getPublicQuote: async (token) => {
      await mockDelay();
      return null;
    },

    updatePublicQuoteResponse: async (token, responseData) => {
      await mockDelay();
      return { success: true };
    },

    generatePDF: async (id) => {
      await mockDelay();
      mockAudit('generate_pdf', 'quotes', { id });
      return {
        url: '#',
        filename: `quote-${id}.pdf`
      };
    },
  },

  // ==================== SERVICE ORDERS APIs ====================
  serviceOrders: {
    list: async (params = {}) => {
      await mockDelay();
      mockAudit('list', 'service_orders', { params });
      return { data: [], total: 0, page: 1, limit: 10 };
    },

    create: async (serviceOrderData) => {
      await mockDelay();
      mockAudit('create', 'service_orders', { serviceOrderData });
      return { id: Date.now().toString(), ...serviceOrderData };
    },

    get: async (id) => {
      await mockDelay();
      mockAudit('get', 'service_orders', { id });
      return null;
    },

    update: async (id, serviceOrderData) => {
      await mockDelay();
      mockAudit('update', 'service_orders', { id, serviceOrderData });
      return { id, ...serviceOrderData };
    },

    delete: async (id) => {
      await mockDelay();
      mockAudit('delete', 'service_orders', { id });
      return true;
    },

    updateStatus: async (id, status) => {
      await mockDelay();
      mockAudit('update_status', 'service_orders', { id, status });
      return { id, status };
    },

    createFromQuote: async (quoteId, serviceOrderData) => {
      await mockDelay();
      mockAudit('create_from_quote', 'service_orders', { quoteId, serviceOrderData });
      return { id: Date.now().toString(), quoteId, ...serviceOrderData };
    },
  },

  // ==================== TRANSACTIONS APIs ====================
  transactions: {
    list: async (params = {}) => {
      await mockDelay();
      mockAudit('list', 'transactions', { params });
      return { data: [], total: 0, page: 1, limit: 10 };
    },

    create: async (transactionData) => {
      await mockDelay();
      mockAudit('create', 'transactions', { transactionData });
      return { id: Date.now().toString(), ...transactionData };
    },

    get: async (id) => {
      await mockDelay();
      mockAudit('get', 'transactions', { id });
      return null;
    },

    update: async (id, transactionData) => {
      await mockDelay();
      mockAudit('update', 'transactions', { id, transactionData });
      return { id, ...transactionData };
    },

    delete: async (id) => {
      await mockDelay();
      mockAudit('delete', 'transactions', { id });
      return true;
    },

    getSummary: async (params = {}) => {
      await mockDelay();
      mockAudit('get_summary', 'transactions', { params });
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
      };
    },

    getBalance: async (params = {}) => {
      await mockDelay();
      mockAudit('get_balance', 'transactions', { params });
      return { balance: 0 };
    },
  },

  // ==================== SETTINGS APIs ====================
  settings: {
    getCompany: async () => {
      await mockDelay();
      mockAudit('get_company_settings', 'settings');
      return {
        name: '',
        email: '',
        phone: '',
        address: ''
      };
    },

    updateCompany: async (settingsData) => {
      await mockDelay();
      mockAudit('update_company_settings', 'settings', { settingsData });
      return settingsData;
    },

    getSystem: async () => {
      await mockDelay();
      mockAudit('get_system_settings', 'settings');
      return {
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        currency: 'BRL'
      };
    },

    updateSystem: async (settingsData) => {
      await mockDelay();
      mockAudit('update_system_settings', 'settings', { settingsData });
      return settingsData;
    },

    getNotifications: async () => {
      await mockDelay();
      mockAudit('get_notification_settings', 'settings');
      return {
        emailNotifications: true,
        pushNotifications: false
      };
    },

    updateNotifications: async (settingsData) => {
      await mockDelay();
      mockAudit('update_notification_settings', 'settings', { settingsData });
      return settingsData;
    },
  },

  // ==================== USERS APIs (Admin only) ====================
  users: {
    list: async (params = {}) => {
      await mockDelay();
      mockAudit('list', 'users', { params });
      return { data: [], total: 0, page: 1, limit: 10 };
    },

    create: async (userData) => {
      await mockDelay();
      mockAudit('create', 'users', { userData });
      return { id: Date.now().toString(), ...userData };
    },

    get: async (id) => {
      await mockDelay();
      mockAudit('get', 'users', { id });
      return null;
    },

    update: async (id, userData) => {
      await mockDelay();
      mockAudit('update', 'users', { id, userData });
      return { id, ...userData };
    },

    delete: async (id) => {
      await mockDelay();
      mockAudit('delete', 'users', { id });
      return true;
    },
  },

  // ==================== FILE UPLOAD ====================
  upload: {
    logo: async (file, onProgress) => {
      await mockDelay();
      mockAudit('upload_logo', 'upload', { fileName: file.name });
      if (onProgress) onProgress(100);
      return {
        url: URL.createObjectURL(file),
        filename: file.name
      };
    },

    document: async (file, onProgress) => {
      await mockDelay();
      mockAudit('upload_document', 'upload', { fileName: file.name });
      if (onProgress) onProgress(100);
      return {
        url: URL.createObjectURL(file),
        filename: file.name
      };
    },
  },
};

export default api;
