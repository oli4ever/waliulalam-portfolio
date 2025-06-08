import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import your API handlers
import sendEmailHandler from './api/send-email.js';
import healthHandler from './api/health.js';

// Convert Vercel-style handlers to Express middleware
const createExpressHandler = (handler) => {
  return async (req, res) => {
    try {
      // Create a mock response object that won't cause infinite recursion
      const vercelStyleRes = {
        getHeader: (name) => res.get(name),
        setHeader: (name, value) => res.set(name, value),
        removeHeader: (name) => res.removeHeader(name),
        status: (statusCode) => {
          res.status(statusCode);
          return vercelStyleRes;
        },
        json: (data) => res.json(data),
        send: (data) => res.send(data),
        end: () => res.end(),
        headersSent: res.headersSent
      };

      // Call the handler with the mock response
      await handler(req, vercelStyleRes);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message 
        });
      }
    }
  };
};

// API Routes
app.post('/api/send-email', createExpressHandler(sendEmailHandler));
app.get('/api/health', createExpressHandler(healthHandler));

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Server running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📧 Email API available at http://localhost:${PORT}/api/send-email`);
  console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🔧 Environment:');
  console.log('   GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('');
});