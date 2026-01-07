// Vercel serverless function for Express API
// This file is in /api/index.ts to be recognized by Vercel as a serverless function
// All requests to /api/* will be handled by this Express app
// Note: Server must be built first (npm run build:server) before this will work
import app from '../server/dist/index';

export default app;
