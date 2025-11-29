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

export const listTools = (_req: Request, res: Response): void => {
  res.json({ tools });
};

export const callTool = async (req: Request, res: Response): Promise<void> => {
  try {
    const { method, payload } = buildBitrixRequest(req.body as McpCallPayload);
    const base = ensureBitrixBase();
    const url = `${base}/${method}.json`;

    const response = await bitrix.post(url, payload);
    res.json({ result: response.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = error instanceof BadRequestError ? 400 : 500;
    res.status(status).json({ error: message });
  }
};

export const ping = (_req: Request, res: Response): void => {
  res.json({ ok: true });
};
