/**
 * Socket.IO server setup.
 *
 * Authenticated sockets:
 *   - Each connecting client sends their JWT as `auth.token`.
 *   - On connection the socket joins:
 *       user:{userId}  — personal events (notifications, booking updates)
 *       role:{role}    — role-wide broadcasts
 *
 * Events emitted to the client:
 *   notification:new   — { id, title, body, type, created_at }
 *   ticket:updated     — { ticketId, status, note }
 *   booking:confirmed  — { bookingId, roomName, startTime }
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let _io = null;

export function initSocket(httpServer) {
  _io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  });

  /* JWT authentication middleware for socket connections */
  _io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      socket.userId = String(payload.sub);
      socket.role   = payload.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  _io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.role}`);

    logger.info(`Socket connected: user=${socket.userId} role=${socket.role}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: user=${socket.userId}`);
    });
  });

  logger.info('Socket.IO server initialized');
  return _io;
}

export function getIO() {
  return _io;
}
