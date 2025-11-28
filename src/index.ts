import 'dotenv/config';
import http from 'http';
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

  // Create HTTP server
  const server = http.createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Default response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        name: 'bitrix24-mcp-proxy',
        version: '1.0.0',
        status: 'running',
      })
    );
  });

  // Start server
  server.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });

  // Graceful shutdown handler
  const shutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  logger.fatal({ error }, 'Failed to start application');
  process.exit(1);
});
