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

const app = express();

// CORS configuration
const allowedOrigins =
  env.nodeEnv === 'production'
    ? env.clientUrls
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

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
