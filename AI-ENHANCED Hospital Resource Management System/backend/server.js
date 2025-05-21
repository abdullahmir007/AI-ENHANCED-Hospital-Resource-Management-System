// Server entry point
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const http = require('http');
const socketIo = require('socket.io');

// Connect to Database with error handling
connectDB()
  .then(() => logger.info('Database connected successfully'))
  .catch(err => {
    logger.error('Database connection failed:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Create HTTP server and configure Socket.io with CORS from env
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.set('io', io);

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    logger.warn('Socket connection attempt without token');
    return next(new Error('Authentication token is required'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const config = require('./config/config');
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.userId = decoded.id;
    logger.info(`Socket authenticated for user: ${decoded.id}`);
    next();
  } catch (err) {
    logger.error(`Socket authentication error: ${err.message}`);
    next(new Error('Invalid authentication token'));
  }
});

// Socket.io event handlers
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userId}`);

  socket.join(`user_${socket.userId}`);

  socket.on('acknowledge-alert', ({ alertId }) => {
    logger.info(`Alert ${alertId} acknowledged by user ${socket.userId}`);
    // TODO: Update alert in DB and emit update event
    io.emit('alert-updated', { alertId, status: 'Acknowledged' });
  });

  socket.on('error', (error) => {
    logger.error(`Socket error: ${error.message}`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.userId}`);
  });
});

// Listen on assigned PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  server.close(() => process.exit(1));
});
