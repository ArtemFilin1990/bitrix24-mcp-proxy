import { NextFunction, Request, Response } from 'express';
import { bitrix, postWithRetry } from '../bitrix/client.js';
import { McpCallPayload } from './types.js';
import { buildBitrixRequest, tools } from './tools.js';

const ensureBitrixBase = (): string => {
  if (!bitrix.defaults.baseURL) {
    throw new Error('Environment variable BITRIX_WEBHOOK_URL is not set');
  }

  return bitrix.defaults.baseURL.replace(/\/$/, '');
};

const validateJsonRequest = (req: Request, res: Response): boolean => {
  if (!req.is('application/json')) {
    res
      .status(415)
      .json({ ok: false, message: 'Content-Type must be application/json', code: 'UNSUPPORTED_MEDIA_TYPE' });
    return false;
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res
      .status(400)
      .json({ ok: false, message: 'Request body must be a JSON object', code: 'INVALID_PAYLOAD' });
    return false;
  }

  return true;
};

export const listTools = (_req: Request, res: Response): void => {
  res.status(200).json({ ok: true, data: { tools } });
};

export const callTool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!validateJsonRequest(req, res)) {
    return;
  }

  const { tool, args }: McpCallPayload = req.body;

  try {
    const { method, payload } = buildBitrixRequest(tool ?? '', args ?? {});
    const base = ensureBitrixBase();
    const url = `${base}/${method}.json`;

    const response = await postWithRetry<{ result?: unknown } | Record<string, unknown>>(url, payload);
    const resultPayload = (response as { result?: unknown })?.result ?? response;
    res.status(200).json({ ok: true, data: resultPayload });
  } catch (error) {
    next(error);
  }
};

export const ping = (_req: Request, res: Response): void => {
  res.status(200).json({ ok: true });
};

export const health = (_req: Request, res: Response): void => {
  res.status(200).json({ ok: true, data: { status: 'healthy' } });
};
