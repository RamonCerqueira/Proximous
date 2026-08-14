import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - ajuste conforme necessário
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      // Navigate to login screen
      // This will be handled by the auth context
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

// Users API
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

// Messages API
export const messagesAPI = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getMessages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: (data) => api.post('/messages/send', data),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  deleteConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}`),
  searchMessages: (params) => api.get('/messages/search', { params }),
};

// Subscriptions API
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrentSubscription: () => api.get('/subscriptions/current'),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
  cancelSubscription: () => api.post('/subscriptions/cancel'),
  getPaymentHistory: (params) => api.get('/subscriptions/payments', { params }),
  applyCoupon: (couponCode) => api.post('/subscriptions/apply-coupon', { coupon_code: couponCode }),
};

// Support API
export const supportAPI = {
  getFAQ: () => api.get('/support/faq'),
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: (params) => api.get('/support/tickets', { params }),
  getTicket: (ticketId) => api.get(`/support/tickets/${ticketId}`),
  updateTicket: (ticketId, data) => api.put(`/support/tickets/${ticketId}`, data),
};

export default api;

