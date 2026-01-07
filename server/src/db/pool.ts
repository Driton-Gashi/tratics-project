import mysql from 'mysql2/promise';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection on startup
pool
  .getConnection()
  .then(connection => {
    logger.info('✅ Database connection successful');
    connection.release();
  })
  .catch(error => {
    logger.error('❌ Database connection failed:', error.message);
    logger.error('Check your database credentials in .env file');
  });

export default pool;
