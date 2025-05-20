const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');
const aiProxy = require('./middleware/aiProxy');

const app = express();

// --- NEW HEALTH CHECK ENDPOINT (like in Flask) ---
app.get('/health', (req, res) => {
  console.log("Health check endpoint accessed");
  return res.json({ status: 'healthy', service: 'hospital-ai-service' });
});

// Enable CORS before other middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Body parser with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helmet security headers
app.use(helmet());

// Custom XSS protection
app.use((req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Special case for arrays
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    // Regular object handling
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value === 'string') {
        obj[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        obj[key] = sanitizeObject(value);
      }
    });
    return obj;
  };

  if (req.body) {
    if (req.originalUrl.includes('/patients/batch')) {
      // For batch uploads, only sanitize strings, not structure
      if (Array.isArray(req.body)) {
        req.body = req.body.map(item => sanitizeObject(item));
      }
    } else {
      req.body = sanitizeObject({ ...req.body });
    }
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  next();
});

// MongoDB operator sanitization
app.use((req, res, next) => {
  const hasMongoDB = obj => {
    if (!obj) return false;
    
    // Special case for arrays
    if (Array.isArray(obj)) {
      return obj.some(item => hasMongoDB(item));
    }
    
    if (typeof obj !== 'object') return false;
    
    const mongoOperators = ['$', '{$'];
    return Object.keys(obj).some(key => {
      const value = obj[key];
      if (mongoOperators.some(op => key.includes(op))) return true;
      if (typeof value === 'object' && value !== null) {
        return hasMongoDB(value);
      }
      return false;
    });
  };

  // Skip MongoDB operator check for batch uploads
  if (req.originalUrl.includes('/patients/batch')) {
    return next();
  }

  if (req.query && hasMongoDB(req.query)) {
    logger.warn('Potentially malicious query detected');
    const safeQuery = {};
    Object.keys(req.query).forEach(key => {
      if (!key.includes('$')) {
        safeQuery[key] = req.query[key];
      }
    });
    Object.keys(req.query).forEach(key => {
      if (!safeQuery[key]) {
        delete req.query[key];
      }
    });
  }

  if (req.body && hasMongoDB(req.body)) {
    logger.warn('Potentially malicious body detected');
    if (Array.isArray(req.body)) {
      // Handle array properly - don't modify the structure
      req.body = req.body.map(item => {
        if (typeof item === 'object' && hasMongoDB(item)) {
          // Handle each item individually
          const safeItem = {};
          Object.keys(item).forEach(key => {
            if (!key.includes('$')) {
              safeItem[key] = item[key];
            }
          });
          return safeItem;
        }
        return item;
      });
    } else {
      // Original code for objects
      const safeBody = {};
      Object.keys(req.body).forEach(key => {
        if (!key.includes('$')) {
          safeBody[key] = req.body[key];
        }
      });
      req.body = safeBody;
    }
  }

  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// Request debugging for batch uploads
app.use((req, res, next) => {
  if (req.originalUrl.includes('/patients/batch')) {
    logger.debug(`Batch request received: ${req.method} ${req.originalUrl}`);
    logger.debug(`Content-Type: ${req.headers['content-type']}`);
    logger.debug(`Content-Length: ${req.headers['content-length']}`);
    logger.debug(`Request body type: ${typeof req.body}`);
    logger.debug(`Is array?: ${Array.isArray(req.body)}`);
    
    if (req.body) {
      if (Array.isArray(req.body)) {
        logger.debug(`Array length: ${req.body.length}`);
        if (req.body.length > 0) {
          logger.debug(`First item keys: ${Object.keys(req.body[0]).join(', ')}`);
        }
      } else {
        logger.debug(`Object keys: ${Object.keys(req.body).join(', ')}`);
      }
    }
  }
  next();
});

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// AI Proxy middleware
app.use(aiProxy);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/beds', require('./routes/beds'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/ai-insights', require('./routes/ai'));
app.use('/api/reports', require('./routes/reports'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;