import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
};

export const contactsService = {
  getAll: () => api.get('/api/contacts'),
  getById: (id) => api.get(`/api/contacts/${id}`),
  create: (data) => api.post('/api/contacts', data),
  update: (id, data) => api.patch(`/api/contacts/${id}`, data),
  delete: (id) => api.delete(`/api/contacts/${id}`),
};

export const tasksService = {
  getAll: (params) => api.get('/api/tasks', { params }),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  complete: (id) => api.patch(`/api/tasks/${id}/complete`),
};

export const dashboardService = {
  getStats: () => api.get('/api/analytics/dashboard'),
};

export const userService = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.patch('/api/users/me', data),
};

export const workspaceService = {
  get: () => api.get('/api/settings/workspace'),
  update: (data) => api.patch('/api/settings/workspace', data),
};

export const dealsService = {
  getAll: () => api.get('/api/deals'),
  getById: (id) => api.get(`/api/deals/${id}`),
  create: (data) => api.post('/api/deals', data),
  update: (id, data) => api.patch(`/api/deals/${id}`, data),
  delete: (id) => api.delete(`/api/deals/${id}`),
};

export const emailTemplateService = {
  getAll: () => api.get('/api/email/templates'),
  getById: (id) => api.get(`/api/email/templates/${id}`),
  getByCategory: (category) => api.get(`/api/email/templates/category/${category}`),
  getDefault: () => api.get('/api/email/templates/default'),
  create: (data) => api.post('/api/email/templates', data),
  update: (id, data) => api.patch(`/api/email/templates/${id}`, data),
  delete: (id) => api.delete(`/api/email/templates/${id}`),
};

export const emailConfigService = {
  configure: (data) => api.post('/api/settings/integrations/email', data),
};

export const whatsappService = {
  getTemplates: () => api.get('/api/whatsapp/templates'),
  send: (data) => api.post('/api/whatsapp/send', data),
};

export const exportService = {
  exportContacts: (format = 'csv') => {
    const token = localStorage.getItem('accessToken');
    window.open(`${API_URL}/api/contacts/export?format=${format}`, '_blank');
  },
  exportDeals: () => {
    window.open(`${API_URL}/api/deals/export`, '_blank');
  },
};

export default api;
