import { Request, Response } from 'express';
import { tools } from '../tools/index.js';

export const ping = (_req: Request, res: Response): Response => res.json({ ok: true });

export const listTools = (_req: Request, res: Response): Response =>
  res.json({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }))
  });

export const callTool = async (req: Request, res: Response): Promise<Response> => {
  const { tool, args } = req.body as { tool?: string; args?: unknown };
  const found = tools.find((item) => item.name === tool);

  if (!found) {
    return res.status(400).json({ error: 'Unknown tool' });
  }

  try {
    const result = await found.handler(args as Record<string, unknown>);
    return res.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ error: message });
  }
};
