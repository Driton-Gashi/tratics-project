// Vercel serverless function for Express API
// This file is in /api/index.ts to be recognized by Vercel as a serverless function
// All requests to /api/* will be handled by this Express app
import app from '../server/src/index';

export default app;
