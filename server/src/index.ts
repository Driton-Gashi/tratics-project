import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const PORT = env.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.nodeEnv}`);
  logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
});
