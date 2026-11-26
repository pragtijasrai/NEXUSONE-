/**
 * SocketContext — provides an authenticated Socket.IO connection.
 *
 * - Connects when the user is authenticated (token available)
 * - Disconnects on sign-out or when the token is cleared
 * - Listens for `notification:new` and shows a toast + triggers a notification count refresh
 *
 * Usage:
 *   const { socket, connected } = useSocket();
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { tokenStore } from '../services/apiClient.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = tokenStore.getAccess();

    /* Only connect when logged in and token is available */
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    /* Already connected */
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      /* Silently fail — socket is a progressive enhancement */
      setConnected(false);
    });

    /* Show toast for real-time notifications */
    socket.on('notification:new', (n) => {
      const typeMap = { success: 'success', warning: 'info', error: 'error', info: 'info' };
      notify(n.title, typeMap[n.type] ?? 'info');
    });

    /* Booking confirmed */
    socket.on('booking:confirmed', (data) => {
      notify(`Room booked: ${data.roomName}`, 'success');
    });

    /* Ticket updated */
    socket.on('ticket:updated', (data) => {
      notify(`Ticket #${data.ticketId} moved to ${data.status}`, 'info');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]); // reconnect when user changes

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
