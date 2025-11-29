import { Request, Response } from 'express';
import { bitrix } from '../bitrix/client.js';
import { McpCallPayload } from './types.js';
import { BadRequestError, buildBitrixRequest, tools } from './tools.js';

const ensureBitrixBase = (): string => {
  if (!bitrix.defaults.baseURL) {
    throw new Error('Environment variable BITRIX_WEBHOOK_URL is not set');
  }

  return bitrix.defaults.baseURL.replace(/\/$/, '');
};

const validateJsonRequest = (req: Request, res: Response): boolean => {
  if (!req.is('application/json')) {
    res.status(415).json({ error: { message: 'Content-Type must be application/json' } });
    return false;
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ error: { message: 'Request body must be a JSON object' } });
    return false;
  }

  return true;
};

const buildErrorResponse = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const upstreamStatus = (error as { response?: { status?: number } })?.response?.status;
  const status = error instanceof BadRequestError
    ? 400
    : typeof upstreamStatus === 'number'
      ? upstreamStatus >= 500
        ? upstreamStatus
        : 502
      : (error as { statusCode?: number })?.statusCode || 500;

  return { status, body: { error: { message } } };
};

export const listTools = (_req: Request, res: Response): void => {
  res.status(200).json({ tools });
};

export const callTool = async (req: Request, res: Response): Promise<void> => {
  if (!validateJsonRequest(req, res)) {
    return;
  }

  const { tool, args }: McpCallPayload = req.body;

  try {
    const { method, payload } = buildBitrixRequest(tool ?? '', args ?? {});
    const base = ensureBitrixBase();
    const url = `${base}/${method}.json`;

    const response = await bitrix.post(url, payload);
    const resultPayload = (response.data as { result?: unknown })?.result ?? response.data;
    res.status(200).json({ result: resultPayload });
  } catch (error) {
    const { status, body } = buildErrorResponse(error);
    res.status(status).json(body);
  }
};

export const ping = (_req: Request, res: Response): void => {
  res.status(200).json({ ok: true });
};
