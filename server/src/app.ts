import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import cimerRoutes from './routes/route-example';
import authRoutes from './auth/auth.routes';
import docsRoutes from './routes/docs.routes';
import meRoutes from './me/me.routes';
import adminRoutes from './admin/admin.routes';
import analyticsRoutes from './analytics/analytics.routes';
import pool from './db/pool';

const app = express();

// Request logging for quick debugging in local + serverless environments
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    // Keep log compact to reduce noise in serverless logs
    console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });
  next();
});

// CORS configuration
const allowedOrigins =
  env.nodeEnv === 'production'
    ? 'https://movie.dritongashi.com'
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

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Basic build/runtime info to help debug deployments
app.get('/health/version', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Deployment info',
    timestamp: new Date().toISOString(),
    runtime: {
      node: process.version,
      env: env.nodeEnv,
    },
    vercel: {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
      region: process.env.VERCEL_REGION || null,
      url: process.env.VERCEL_URL || null,
    },
  });
});

// Readiness check for DB + route availability
app.get('/health/check', async (_req, res) => {
  const timestamp = new Date().toISOString();
  const endpoints = {
    auth: '/api/auth',
    me: '/api/me',
    admin: '/api/admin',
    analytics: '/api/analytics',
    cimerat: '/api/cimerat',
    docs: '/docs',
    health: '/health',
  };

  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const latencyMs = Date.now() - start;

    res.status(200).json({
      success: true,
      message: 'Database connected and API routes available',
      timestamp,
      checks: {
        database: {
          ok: true,
          latencyMs,
        },
        endpoints: {
          ok: true,
          routes: endpoints,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database connection failed';

    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      timestamp,
      checks: {
        database: {
          ok: false,
          error: message,
        },
        endpoints: {
          ok: true,
          routes: endpoints,
        },
      },
    });
  }
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
app.use('/docs', docsRoutes);
app.use('/api/cimerat', cimerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
