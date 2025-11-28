import { Request, Response } from 'express';
import { McpCallPayload, McpTool } from './types.js';

const tools: McpTool[] = [
  {
    name: 'ping',
    description: 'Health check tool for MCP server',
  },
];

export const listTools = (_req: Request, res: Response): void => {
  res.json({ tools });
};

export const callTool = (req: Request, res: Response): void => {
  const payload = req.body as McpCallPayload;

  if (!payload?.tool) {
    res.status(400).json({ error: 'Tool name is required' });
    return;
  }

  if (payload.tool === 'ping') {
    res.json({ result: 'pong' });
    return;
  }

  res.status(404).json({ error: `Tool not found: ${payload.tool}` });
};

export const ping = (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
};
