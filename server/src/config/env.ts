import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  jwtSecret: string;
  cookieSecure: boolean;
  clientUrls: string[];
}

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
] as const;

function validateEnv(): void {
  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file or .env.example for reference.'
    );
  }
}

export function getEnv(): EnvConfig {
  validateEnv();

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    port: Number(process.env.PORT) || 4000,
    nodeEnv,
    database: {
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
    },
    jwtSecret: process.env.JWT_SECRET!,
    cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
    clientUrls: (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean),
  };
}

export const env = getEnv();
