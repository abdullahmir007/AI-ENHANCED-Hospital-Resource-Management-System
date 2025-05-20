// src/services/socketService.js
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket) return;

    this.socket = io(process.env.REACT_APP_SOCKET_URL || '', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    // Set up listeners for alerts and notifications
    this.socket.on('new-alert', ({ alert }) => {
      toast.info(`New Alert: ${alert.title}`);
    });

    this.socket.on('alert-updated', ({ alert }) => {
      if (alert.status === 'Resolved') {
        toast.success(`Alert resolved: ${alert.title}`);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // Emit event
  emit(event, data) {
    if (!this.socket || !this.connected) return;
    this.socket.emit(event, data);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;