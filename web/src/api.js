import axios from 'axios';
import { handleAuthError } from './utils';

const API_BASE = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors globally
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleAuthError(error);
    }
    return Promise.reject(error);
  }
);

// Helper to get auth headers (for backward compatibility)
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
});

// Tickets
export const ticketsApi = {
  create: (data) => apiClient.post('/tickets', data),
  list: (params = {}) => apiClient.get('/tickets', { params }),
  get: (id) => apiClient.get(`/tickets/${id}`),
  update: (id, data) => apiClient.patch(`/tickets/${id}`, data),
  regenerate: (id, data = {}) => apiClient.post(`/tickets/${id}/regenerate`, data),
};

// Knowledge Base
export const kbApi = {
  list: () => apiClient.get('/kb'),
  get: (id) => apiClient.get(`/kb/${id}`),
  create: (data) => apiClient.post('/kb', data),
  update: (id, data) => apiClient.patch(`/kb/${id}`, data),
  delete: (id) => apiClient.delete(`/kb/${id}`),
  search: (q, k = 3) => apiClient.get('/kb/search', { params: { q, k } }),
  reembed: () => apiClient.post('/kb/reembed', {}),
};

