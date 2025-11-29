import { ErrorRequestHandler } from 'express';
import { BitrixClientError } from '../bitrix/client.js';
import { BadRequestError } from './validation.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isValidation = err instanceof BadRequestError;
  const status = isValidation ? 400 : (err as { statusCode?: number })?.statusCode || 500;
  const code = isValidation ? 'VALIDATION_ERROR' : (err as { code?: string })?.code || 'INTERNAL_ERROR';
  const message = err instanceof Error ? err.message : 'Internal server error';
  const details = (err as BitrixClientError)?.details ?? null;

  res.status(status).json({ ok: false, message, code, details });
};
