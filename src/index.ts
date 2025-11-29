import dotenv from 'dotenv';
import path from 'node:path';
import { createServer } from './mcp/server.js';

dotenv.config();

const app = createServer();

const executedFileUrl = new URL(path.resolve(process.argv[1]), 'file://').href;
if (import.meta.url === executedFileUrl) {
  const port = Number(process.env.MCP_PORT) || 3000;
  app.listen(port, () => {
    console.log(`MCP server listening on port ${port}`);
  });
}

export default app;
