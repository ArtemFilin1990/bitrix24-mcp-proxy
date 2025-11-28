import express, { Express } from 'express';
import { router as mcpRouter } from './router.js';

export const createServer = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/mcp', mcpRouter);
  return app;
};
