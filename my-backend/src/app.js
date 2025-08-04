import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { cleanupExpiredSessions } from './utils/sessionManager.js';

// Load environment variables from .env file
dotenv.config();

// Import route modules
import routes from './routes/index.js';
import sequelize from './models/index.js';
import authRoutes from './routes/auth.js';
import feedbackRoutes from './routes/feedback.js';
import fileScannerRoutes from './routes/fileScanner.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/filescanner', fileScannerRoutes);
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: err.errors.map(e => e.message) 
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ 
      error: 'Duplicate entry', 
      details: err.errors.map(e => e.message) 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Session cleanup job (run every 5 minutes)
setInterval(async () => {
  try {
    await cleanupExpiredSessions();
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}, 5 * 60 * 1000);

// Environment check endpoint for debugging
// Returns environment configuration status (useful for troubleshooting)
app.get('/env-check', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    virusTotalKeyExists: !!process.env.VIRUSTOTAL_API_KEY,
    virusTotalKeyLength: process.env.VIRUSTOTAL_API_KEY?.length,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('VIRUS') || key.includes('API'))
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Initialize database connection and sync models
// This ensures the database is ready before accepting requests
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    return sequelize.sync({ force: false }); // Sync models without dropping tables
  })
  .then(() => {
    console.log('✅ Database models synchronized.');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Server is running but database features will not work.');
    console.log('🔧 Run "npm run setup" to fix database issues.');
  });

export default app;