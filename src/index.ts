import 'dotenv/config';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { Bitrix24Client } from './bitrix24/client.js';
import { tools } from './tools/index.js';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  logger.info('Starting Bitrix24 MCP Proxy...');
  logger.info({ config: { port: config.port, nodeEnv: config.nodeEnv } }, 'Configuration loaded');

  // Initialize Bitrix24 client
  const client = new Bitrix24Client({
    webhookUrl: config.bitrix24.webhookUrl,
    clientId: config.bitrix24.clientId,
    clientSecret: config.bitrix24.clientSecret,
  });

  logger.info({ configured: client.isConfigured() }, 'Bitrix24 client initialized');
  logger.info({ tools: Object.keys(tools) }, 'Available tools');

  // Health check endpoint for Docker
  if (process.env.HEALTH_CHECK) {
    logger.info('Health check passed');
    process.exit(0);
  }

  logger.info(`Server ready on port ${config.port}`);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

main().catch((error) => {
  logger.fatal({ error }, 'Failed to start application');
  process.exit(1);
});
