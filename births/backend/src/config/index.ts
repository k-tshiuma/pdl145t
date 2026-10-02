import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',

  db: {
    path: path.resolve(process.cwd(), process.env.DB_PATH || './data/pdl145t.db'),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  session: {
    timeoutSeconds: parseInt(process.env.SESSION_TIMEOUT || '1800', 10),
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: path.resolve(process.cwd(), process.env.LOG_FILE || './logs/pdl145t.log'),
  },

  pdf: {
    storagePath: path.resolve(process.cwd(), process.env.PDF_STORAGE_PATH || './data/certificates'),
  },
} as const;
