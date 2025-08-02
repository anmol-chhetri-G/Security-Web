import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

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

// Configure CORS for frontend communication
// Allows requests from frontend URL specified in environment variables
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000'
  ],
  credentials: true
}));

// Parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API route handlers
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/file-scanner', fileScannerRoutes);

// Global error handling middleware
// Catches any unhandled errors and returns a generic error response
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Health check endpoint for monitoring
// Returns server status and database connection status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: sequelize.authenticate ? 'Connected' : 'Disconnected'
  });
});

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