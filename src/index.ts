import { config } from './config/env.js';
import { createServer } from './mcp/server.js';

const app = createServer();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`MCP server listening on port ${config.port} in ${config.nodeEnv} mode`);
});
