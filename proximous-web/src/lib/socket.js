import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5001';
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('proximous_token');
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      auth: token ? { token } : {}
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Socket.IO Real-time server:', socket.id);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to Socket.IO after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_error', (error) => {
      console.warn('⚠️ Socket.IO Reconnection attempt error:', error.message);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket.IO Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.IO server. Reason:', reason);
    });
  }
  return socket;
};

export const getSocket = () => socket || initSocket();

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
