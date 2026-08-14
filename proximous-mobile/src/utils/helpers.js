// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// User helpers
export const getUserInitials = (user) => {
  if (!user?.name) return '??';
  
  const names = user.name.trim().split(' ');
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }
  
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export const generateAvatarUrl = (name, size = 200) => {
  const initials = getUserInitials({ name });
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=E6E6FA&color=6B46C1&bold=true`;
};

export const formatUserAge = (birthDate) => {
  if (!birthDate) return '';
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Distance helpers
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Date helpers
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}min atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

export const formatLastSeen = (lastSeenString) => {
  if (!lastSeenString) return 'Nunca visto';
  
  const lastSeen = new Date(lastSeenString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
  
  if (diffInMinutes < 5) {
    return 'Online';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}min atrás`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d atrás`;
  }
};

// Personality tag colors
export const getPersonalityTagColor = (tag) => {
  const colors = {
    'Criativo(a)': 'bg-purple-100 text-purple-800',
    'Analítico(a)': 'bg-blue-100 text-blue-800',
    'Empático(a)': 'bg-pink-100 text-pink-800',
    'Aventureiro(a)': 'bg-orange-100 text-orange-800',
    'Calmo(a)': 'bg-green-100 text-green-800',
    'Engraçado(a)': 'bg-yellow-100 text-yellow-800',
    'Intelectual': 'bg-indigo-100 text-indigo-800',
    'Esportivo(a)': 'bg-red-100 text-red-800',
    'Artístico(a)': 'bg-purple-100 text-purple-800',
    'Tecnológico(a)': 'bg-gray-100 text-gray-800',
    'Musical': 'bg-pink-100 text-pink-800',
    'Leitor(a)': 'bg-blue-100 text-blue-800',
  };
  
  return colors[tag] || 'bg-gray-100 text-gray-800';
};

// Format helpers
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

export const formatNumber = (number) => {
  if (number < 1000) return number.toString();
  if (number < 1000000) return `${(number / 1000).toFixed(1)}k`;
  return `${(number / 1000000).toFixed(1)}M`;
};

// Storage helpers
export const getStorageKey = (key) => `@proximous:${key}`;

// Error helpers
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Erro interno. Tente novamente.';
};

// Social style helpers
export const getSocialStyleLabel = (style) => {
  const labels = {
    'shy': 'Tímido(a)',
    'introverted': 'Introvertido(a)',
    'extroverted': 'Extrovertido(a)'
  };
  
  return labels[style] || style;
};

export const getSocialStyleColor = (style) => {
  const colors = {
    'shy': '#E6E6FA',
    'introverted': '#87CEEB',
    'extroverted': '#FFB6C1'
  };
  
  return colors[style] || '#E6E6FA';
};

