import express from 'express';
import { router as mcpRouter } from './router.js';

export const createServer = () => {
  const app = express();
  app.use(express.json());
  app.use('/mcp', mcpRouter);
  return app;
};
