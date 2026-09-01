import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URLs de API disponíveis
export const PRODUCTION_API_URL = 'https://proximous.genioplay.com.br/api';
export const LOCAL_API_URL = 'http://localhost:5000/api';

// Seleção automática: No modo Web local usa o backend local ou produção conforme configurado
export const API_BASE_URL = (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? (LOCAL_API_URL) // Altere para PRODUCTION_API_URL se o backend de produção estiver com CORS liberado
  : PRODUCTION_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT Bearer token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao recuperar token de autenticação:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized & Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          if (res.data.success && res.data.access_token) {
            await AsyncStorage.setItem('authToken', res.data.access_token);
            if (res.data.refresh_token) {
              await AsyncStorage.setItem('refreshToken', res.data.refresh_token);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        console.error('Falha na renovação do token:', refreshErr);
      }
      
      // Clear storage on unrecoverable session
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Moments & Social Feed API
export const momentsAPI = {
  getMoments: (params) => api.get('/moments', { params }),
  createMoment: (data) => api.post('/moments', data),
  toggleLike: (momentId) => api.post(`/moments/${momentId}/like`),
  sendIcebreaker: (momentId, data) => api.post(`/moments/${momentId}/icebreaker`, data),
  deleteMoment: (momentId) => api.delete(`/moments/${momentId}`),
};

// Users & Discovery API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadPhoto: (formData) => api.post('/users/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  discover: (params) => api.get('/users/discover', { params }),
  updateAvailability: (data) => api.put('/users/availability', data),
  getStats: () => api.get('/users/stats'),
  getAchievements: () => api.get('/users/achievements'),
  updateLocation: (location) => api.put('/users/location', location),
  deleteAccount: () => api.delete('/users/account'),
};

// Activities API (Modo AGORA)
export const activitiesAPI = {
  getNearby: (params) => api.get('/activities/nearby', { params }),
  create: (data) => api.post('/activities', data),
  join: (activityId) => api.post(`/activities/${activityId}/join`),
  leave: (activityId) => api.delete(`/activities/${activityId}/leave`),
  getMyActivities: () => api.get('/activities/my'),
};

// Matching API
export const matchingAPI = {
  sendLike: (data) => api.post('/matching/like', data),
  getMatches: (params) => api.get('/matching/matches', { params }),
  getSentLikes: (params) => api.get('/matching/sent-likes', { params }),
  getReceivedLikes: (params) => api.get('/matching/received-likes', { params }),
  unmatch: (matchId) => api.delete(`/matching/matches/${matchId}`),
  getIcebreakers: () => api.get('/matching/icebreakers'),
  getCompliments: () => api.get('/matching/compliments'),
};

// Messages & Chat API
export const messagesAPI = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getMessages: (conversationId, params) => api.get(`/messages/conversation/${conversationId}`, { params }),
  sendMessage: (data) => api.post('/messages/send', data),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  deleteConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}`),
  searchMessages: (params) => api.get('/messages/search', { params }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/read-all'),
  markSingleRead: (notificationId) => api.post(`/notifications/${notificationId}/read`),
};

// Subscriptions & Support
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrentSubscription: () => api.get('/subscriptions/current'),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
};

export const supportAPI = {
  getFAQ: () => api.get('/support/faq'),
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: (params) => api.get('/support/tickets', { params }),
};

export default api;
export { api };
