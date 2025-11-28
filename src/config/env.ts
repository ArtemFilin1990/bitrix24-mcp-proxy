import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return value;
};

export const config = {
  bitrixUrl: requireEnv('BITRIX_WEBHOOK_URL'),
  port: parseInt(process.env.MCP_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};
