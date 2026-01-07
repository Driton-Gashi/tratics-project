import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { logger } from './utils/logger';
import cimerRoutes from './routes/route-example';
import authRoutes from './auth/auth.routes';
import docsRoutes from './routes/docs.routes';

const app = express();

// CORS configuration
const allowedOrigins =
  env.nodeEnv === 'production'
    ? [env.clientUrl]
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base path handling for Vercel
// When deployed on Vercel, requests come through /api, so we need to handle
// both /api/auth/login (Vercel) and /api/auth/login (local) correctly
// Vercel passes the full path, so routes work as-is

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.get('/', (_req, res) => {
  const baseUrl = `${_req.protocol}://${_req.get('host')}`;

  res.status(200).json({
    success: true,
    message: 'Welcome to the Tratics API',
    version: '1.0.0',
    documentation: `${baseUrl}/docs`,
    health: `${baseUrl}/health`,
    endpoints: {
      auth: `${baseUrl}/api/auth`,
      docs: `${baseUrl}/docs`,
    },
  });
});

// API routes
// Note: When deployed on Vercel, these routes will be served from /api, so
// /api/auth/login will work correctly. In local dev, the server runs on port 4000
// and these routes are accessible at http://localhost:4000/api/auth/login
app.use('/docs', docsRoutes);
app.use('/api/cimerat', cimerRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Export app for Vercel serverless functions
export default app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = env.port;

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${env.nodeEnv}`);
    logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
  });
}
