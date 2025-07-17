import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;
  API_VERSION: string;

  // Database
  DATABASE_URL: string;

  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // CORS
  CORS_ORIGIN: string | string[];

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;

  // Email
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_FROM: string;

  // File Upload
  UPLOAD_MAX_SIZE: number;
  UPLOAD_DIR: string;

  // Logging
  LOG_LEVEL: string;
  LOG_DIR: string;

  // Security
  BCRYPT_ROUNDS: number;
  ENCRYPTION_KEY: string;

  // External APIs
  VIACEP_API_URL: string;
  ASAAS_API_URL: string;
  ASAAS_API_KEY: string;
  MERCADOPAGO_ACCESS_TOKEN: string;
}

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (name: string, defaultValue?: number): number => {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

export const env: EnvConfig = {
  // Server
  PORT: getEnvNumber('PORT', 3001),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),

  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '24h'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),

  // CORS
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5173').split(',').map(origin => origin.trim()),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100),

  // Email
  EMAIL_HOST: getEnvVar('EMAIL_HOST', 'smtp.gmail.com'),
  EMAIL_PORT: getEnvNumber('EMAIL_PORT', 587),
  EMAIL_USER: getEnvVar('EMAIL_USER', 'noreply@metalgest.com'),
  EMAIL_PASS: getEnvVar('EMAIL_PASS', 'dummy-password'),
  EMAIL_FROM: getEnvVar('EMAIL_FROM', 'MetalGest <noreply@metalgest.com>'),

  // File Upload
  UPLOAD_MAX_SIZE: getEnvNumber('UPLOAD_MAX_SIZE', 5242880),
  UPLOAD_DIR: getEnvVar('UPLOAD_DIR', 'uploads'),

  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_DIR: getEnvVar('LOG_DIR', 'logs'),

  // Security
  BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
  ENCRYPTION_KEY: getEnvVar('ENCRYPTION_KEY'),

  // External APIs
  VIACEP_API_URL: getEnvVar('VIACEP_API_URL', 'https://viacep.com.br/ws'),
  ASAAS_API_URL: getEnvVar('ASAAS_API_URL', 'https://www.asaas.com/api/v3'),
  ASAAS_API_KEY: getEnvVar('ASAAS_API_KEY', 'dummy-key'),
  MERCADOPAGO_ACCESS_TOKEN: getEnvVar('MERCADOPAGO_ACCESS_TOKEN', 'dummy-token'),
};

export default env;