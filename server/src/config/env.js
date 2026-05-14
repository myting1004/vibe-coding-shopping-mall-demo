import 'dotenv/config';

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/shopping_mall_demo'),
  corsOrigin: (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
