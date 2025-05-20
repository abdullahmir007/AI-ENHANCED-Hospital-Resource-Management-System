// Server entry point
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Connect to Database
connectDB();

// Socket.io setup
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);

// Configure Socket.io with CORS options
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Make io available to the app
app.set('io', io);

// Socket.io middleware for authentication
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

// Socket.io connection handler
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userId}`);
  
  // Join a room based on user ID
  socket.join(`user_${socket.userId}`);
  
  // Listen for alert acknowledgements
  socket.on('acknowledge-alert', ({ alertId }) => {
    logger.info(`Alert ${alertId} acknowledged by user ${socket.userId}`);
    // Logic to acknowledge alert
    // This would update the alert in the database
    // Then emit an event to all relevant users
    io.emit('alert-updated', { alertId, status: 'Acknowledged' });
  });
  
  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error: ${error.message}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.userId}`);
  });
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});