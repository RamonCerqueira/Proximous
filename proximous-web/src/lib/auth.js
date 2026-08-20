// Authentication utilities
export const AUTH_TOKEN_KEY = 'proximous_token';
export const AUTH_USER_KEY = 'proximous_user';

export const getToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getUser = () => {
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getUser();
  return user && user.type === 'admin';
};

export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

export const getUserInitials = (user) => {
  if (!user || !user.name) return 'U';
  
  const names = user.name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

export const formatUserAge = (age) => {
  if (!age) return '';
  return `${age} anos`;
};

export const formatDistance = (distance) => {
  if (distance === undefined || distance === null || distance === '') return '';
  if (typeof distance === 'string') {
    if (distance.includes('km') || distance.includes('m')) return distance;
  }
  const num = typeof distance === 'number' ? distance : parseFloat(distance);
  if (isNaN(num)) return typeof distance === 'string' ? distance : '';
  if (num < 0.5) return 'A menos de 500m';
  if (num < 1) return `${(num * 1000).toFixed(0)}m`;
  return `${num.toFixed(1).replace('.', ',')} km`;
};

export const getPersonalityTagColor = (tag) => {
  const colors = {
    'shy': 'bg-blue-100 text-blue-800',
    'introverted': 'bg-purple-100 text-purple-800',
    'extroverted': 'bg-green-100 text-green-800',
    'creative': 'bg-pink-100 text-pink-800',
    'analytical': 'bg-gray-100 text-gray-800',
    'empathetic': 'bg-yellow-100 text-yellow-800',
    'adventurous': 'bg-orange-100 text-orange-800',
    'calm': 'bg-teal-100 text-teal-800',
  };
  
  return colors[tag?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export const getSocialStyleLabel = (style) => {
  const labels = {
    'shy': 'Tímido(a)',
    'introverted': 'Introvertido(a)',
    'extroverted': 'Extrovertido(a)',
  };
  
  return labels[style] || style;
};

export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'Nunca visto';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d atrás`;
  
  return lastSeenDate.toLocaleDateString('pt-BR');
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatCurrency = (amount, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('pt-BR');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusColor = (status) => {
  const colors = {
    'available': 'bg-green-100 text-green-800',
    'busy': 'bg-red-100 text-red-800',
    'observing': 'bg-yellow-100 text-yellow-800',
    'offline': 'bg-gray-100 text-gray-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status) => {
  const labels = {
    'available': 'Disponível',
    'busy': 'Ocupado(a)',
    'observing': 'Observando',
    'offline': 'Offline',
  };
  
  return labels[status] || status;
};

export const getPriorityColor = (priority) => {
  const colors = {
    'low': 'bg-blue-100 text-blue-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800',
  };
  
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export const getPriorityLabel = (priority) => {
  const labels = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'urgent': 'Urgente',
  };
  
  return labels[priority] || priority;
};

export const getCategoryLabel = (category) => {
  const labels = {
    'general': 'Geral',
    'account': 'Conta',
    'premium': 'Premium',
    'safety': 'Segurança',
    'technical': 'Técnico',
    'billing': 'Cobrança',
    'abuse': 'Abuso',
    'other': 'Outro',
  };
  
  return labels[category] || category;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateAvatarUrl = (name, size = 100) => {
  const initials = getUserInitials({ name });
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=8b7aa8&color=ffffff&bold=true`;
};

