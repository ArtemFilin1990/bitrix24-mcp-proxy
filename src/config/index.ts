/**
 * Application configuration
 */
export interface Config {
  /** Node environment */
  nodeEnv: string;
  /** Server port */
  port: number;
  /** Log level */
  logLevel: string;
  /** Bitrix24 configuration */
  bitrix24: {
    /** Webhook URL */
    webhookUrl: string;
    /** OAuth Client ID */
    clientId: string;
    /** OAuth Client Secret */
    clientSecret: string;
  };
}

/**
 * Load configuration from environment variables
 */
function loadConfig(): Config {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    bitrix24: {
      webhookUrl: process.env.B24_WEBHOOK_URL || '',
      clientId: process.env.B24_CLIENT_ID || '',
      clientSecret: process.env.B24_CLIENT_SECRET || '',
    },
  };
}

export const config = loadConfig();
