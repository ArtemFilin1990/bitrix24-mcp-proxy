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
  bitrixClientId: process.env.BITRIX_CLIENT_ID,
  bitrixClientSecret: process.env.BITRIX_CLIENT_SECRET,
  bitrixPortalDomain: process.env.BITRIX_PORTAL_DOMAIN,
  bitrixTimeoutMs: parseInt(process.env.BITRIX_TIMEOUT_MS || '8000', 10),
  bitrixRetryCount: parseInt(process.env.BITRIX_RETRY_COUNT || '3', 10),
  bitrixRetryDelayMs: parseInt(process.env.BITRIX_RETRY_DELAY_MS || '500', 10),
  port: parseInt(process.env.MCP_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};
