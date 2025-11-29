import { Request, Response } from 'express';
import { bitrix } from '../bitrix/client.js';
import { McpCallPayload } from './types.js';
import { BadRequestError, ConfigurationError, buildBitrixRequest, toolNames } from './tools.js';

const respondWithError = (res: Response, status: number, message: string, code: string): void => {
  res.status(status).json({ error: { message, code } });
};

const ensureJsonRequest = (req: Request): boolean => {
  const contentType = req.headers['content-type'] ?? '';
  return contentType.toLowerCase().includes('application/json');
};

const ensureBitrixBase = (): string => {
  if (!bitrix.defaults.baseURL) {
    throw new ConfigurationError('Environment variable BITRIX_WEBHOOK_URL is not set');
  }

  return bitrix.defaults.baseURL.replace(/\/$/, '');
};

export const listTools = (_req: Request, res: Response): void => {
  res.json({ tools: toolNames });
};

export const callTool = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureJsonRequest(req)) {
      respondWithError(res, 415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE');
      return;
    }

    if (req.method && req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      respondWithError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
      return;
    }

    const { method, payload } = buildBitrixRequest(req.body as McpCallPayload);
    const base = ensureBitrixBase();
    const url = `${base}/${method}.json`;

    const response = await bitrix.post(url, payload);
    const result = response.data?.result ?? response.data;
    res.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = error instanceof BadRequestError ? 400 : 500;
    const code = error instanceof BadRequestError
      ? 'BAD_REQUEST'
      : error instanceof ConfigurationError
        ? 'CONFIGURATION_ERROR'
        : 'INTERNAL_ERROR';
    respondWithError(res, status, message, code);
  }
};

export const ping = (_req: Request, res: Response): void => {
  res.json({ ok: true });
};
