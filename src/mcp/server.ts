import express, { NextFunction, Request, Response } from 'express';
import { errorHandler } from './errorMiddleware.js';
import { router as mcpRouter } from './router.js';

export const createServer = () => {
  const app = express();
  app.use(express.json());
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ ok: false, message: 'Invalid JSON payload', code: 'INVALID_JSON' });
      return;
    }

    next(error);
  });
  app.use('/mcp', mcpRouter);
  app.use(errorHandler);
  return app;
};
