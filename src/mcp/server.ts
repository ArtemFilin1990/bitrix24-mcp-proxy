import express, { NextFunction, Request, Response } from 'express';
import { router as mcpRouter } from './router.js';

export const createServer = () => {
  const app = express();
  app.use(express.json());
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: { message: 'Invalid JSON payload' } });
      return;
    }

    next(error);
  });
  app.use('/mcp', mcpRouter);
  return app;
};
