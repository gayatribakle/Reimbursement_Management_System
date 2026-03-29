import { io } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

let socket = null;

export const connectSocket = () => {
  const { user } = useAuthStore.getState();
  if (!user) return;

  socket = io('http://localhost:5000', {
    autoConnect: false,
    auth: {
      userId: user.id,
      companyId: user.companyId,
    },
  });

  socket.connect();

  socket.on('connect', () => {
    if (import.meta.env.DEV) {
      console.log('[Socket] Connected:', socket.id);
    }
    socket.emit('join', { userId: user.id, companyId: user.companyId });
  });

  socket.on('disconnect', () => {
    if (import.meta.env.DEV) {
      console.log('[Socket] Disconnected');
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default socket;
