import axios from 'axios';

// API base URL - adjust for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('proximous_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
let _isRefreshing = false;
let _failedQueue = [];

const processQueue = (error, token = null) => {
  _failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  _failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('proximous_refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('proximous_token');
        localStorage.removeItem('proximous_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        const newToken = res.data.access_token;
        localStorage.setItem('proximous_token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('proximous_token');
        localStorage.removeItem('proximous_refresh_token');
        localStorage.removeItem('proximous_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addPhoto: (photoUrl) => api.post('/users/photos', { photo_url: photoUrl }),
  deletePhoto: (photoUrl) => api.delete('/users/photos', { data: { photo_url: photoUrl } }),
  discover: (params) => api.get('/users/discover', { params }),
  getUser: (userId) => api.get(`/users/${userId}`),
  getStats: () => api.get('/users/stats'),
  getAchievements: () => api.get('/users/achievements'),
  updatePrivacySettings: (data) => api.put('/users/privacy-settings', data),
  updateAvailability: (data) => api.put('/users/availability', data),
  deactivateAccount: (reason) => api.post('/users/deactivate', { reason }),
  getEmpathyHistory: () => api.get('/users/empathy-history'),
  search: (params) => api.get('/users/search', { params }),
};

// Upload API
export const uploadAPI = {
  uploadPhoto: (formData) => api.post('/upload/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Activities API (Modo AGORA)
export const activitiesAPI = {
  getNearby: (params) => api.get('/activities/nearby', { params }),
  create: (data) => api.post('/activities', data),
  join: (activityId) => api.post(`/activities/${activityId}/join`),
  leave: (activityId) => api.delete(`/activities/${activityId}/leave`),
  deleteActivity: (activityId) => api.delete(`/activities/${activityId}`),
  approveParticipant: (activityId, userId) => api.post(`/activities/${activityId}/participants/${userId}/approve`),
  rejectParticipant: (activityId, userId) => api.post(`/activities/${activityId}/participants/${userId}/reject`),
  getMyActivities: () => api.get('/activities/my'),
};



// Moments API
export const momentsAPI = {
  getMoments: (params) => api.get('/moments', { params }),
  createMoment: (data) => api.post('/moments', data),
  toggleLike: (momentId) => api.post(`/moments/${momentId}/like`),
  sendIcebreaker: (momentId, text) => api.post(`/moments/${momentId}/icebreaker`, { text }),
};



// Matching API
export const matchingAPI = {
  sendLike: (data) => api.post('/matching/like', data),
  unlike: (receiverId) => api.post('/matching/unlike', { receiver_id: receiverId }),
  getSentLikes: (params) => api.get('/matching/likes/sent', { params }),
  getReceivedLikes: (params) => api.get('/matching/likes/received', { params }),
  getMatches: (params) => api.get('/matching/matches', { params }),
  unmatch: (matchId) => api.post(`/matching/matches/${matchId}/unmatch`),
  getIcebreakers: () => api.get('/matching/icebreakers'),
  getCompliments: () => api.get('/matching/compliments'),
  getStats: () => api.get('/matching/stats'),
};

// Subscriptions API
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrentSubscription: () => api.get('/subscriptions/current'),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
  cancelSubscription: (data) => api.post('/subscriptions/cancel', data),
  reactivateSubscription: () => api.post('/subscriptions/reactivate'),
  changePlan: (data) => api.post('/subscriptions/change-plan', data),
  getPaymentHistory: (params) => api.get('/subscriptions/payment-history', { params }),
  validateCoupon: (couponCode) => api.post('/subscriptions/validate-coupon', { coupon_code: couponCode }),
  getUsageStats: () => api.get('/subscriptions/usage-stats'),
  applyCoupon: (code) => api.post('/subscriptions/apply-coupon', { code }),
  updatePaymentMethod: (data) => api.put('/subscriptions/payment-method', data),
  getSubscriptionStatus: () => api.get('/subscriptions/status'),
};

// Messages API
export const messagesAPI = {
  sendMessage: (data) => api.post('/messages/send', data),
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getConversation: (userId, params) => api.get(`/messages/conversation/${userId}`, { params }),
  markAsRead: (messageId) => api.post(`/messages/${messageId}/read`),
  markAllAsRead: (userId) => api.post(`/messages/mark-all-read/${userId}`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  searchMessages: (params) => api.get('/messages/search', { params }),
  getStats: () => api.get('/messages/stats'),
};

// Support API
export const supportAPI = {
  createTicket: (data) => api.post('/support/tickets', data),
  getMyTickets: (params) => api.get('/support/tickets/my', { params }),
  getTicket: (ticketId) => api.get(`/support/tickets/${ticketId}`),
  addMessage: (ticketId, data) => api.post(`/support/tickets/${ticketId}/messages`, data),
  closeTicket: (ticketId) => api.post(`/support/tickets/${ticketId}/close`),
  rateSatisfaction: (ticketId, data) => api.post(`/support/tickets/${ticketId}/satisfaction`, data),
  getFAQs: (params) => api.get('/support/faq', { params }),
  getFAQCategories: () => api.get('/support/faq/categories'),
  voteFAQ: (faqId, data) => api.post(`/support/faq/${faqId}/vote`, data),
  contactForm: (data) => api.post('/support/contact', data),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/read-all'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
};

// Advertising API

export const advertisingAPI = {
  serveAd: (params) => api.get('/advertising/ads/serve', { params }),
  recordClick: (data) => api.post('/advertising/ads/click', data),
};

// Admin API (for admin users)
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  banUser: (userId, data) => api.post(`/admin/users/${userId}/ban`, data),
  unbanUser: (userId) => api.post(`/admin/users/${userId}/unban`),
  removeMessage: (messageId, data) => api.post(`/admin/messages/${messageId}/remove`, data),
  getAnalytics: (type, params) => api.get(`/admin/analytics/${type}`, { params }),
  getAdmins: (params) => api.get('/admin/admins', { params }),
  createAdmin: (data) => api.post('/admin/admins', data),
  getActions: (params) => api.get('/admin/actions', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  
  // Support management
  getTickets: (params) => api.get('/support/admin/tickets', { params }),
  assignTicket: (ticketId, data) => api.post(`/support/admin/tickets/${ticketId}/assign`, data),
  resolveTicket: (ticketId, data) => api.post(`/support/admin/tickets/${ticketId}/resolve`, data),
  
  // FAQ management
  getFAQs: (params) => api.get('/support/admin/faq', { params }),
  createFAQ: (data) => api.post('/support/admin/faq', data),
  updateFAQ: (faqId, data) => api.put(`/support/admin/faq/${faqId}`, data),
  deleteFAQ: (faqId) => api.delete(`/support/admin/faq/${faqId}`),
  
  // Advertising management
  getAdvertisers: (params) => api.get('/advertising/admin/advertisers', { params }),
  approveAdvertiser: (advertiserId) => api.post(`/advertising/admin/advertisers/${advertiserId}/approve`),
  approveCampaign: (campaignId) => api.post(`/advertising/admin/campaigns/${campaignId}/approve`),
  rejectCampaign: (campaignId, data) => api.post(`/advertising/admin/campaigns/${campaignId}/reject`, data),
};

export default api;

