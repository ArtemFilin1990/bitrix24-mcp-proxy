import { createDeal } from './createDeal.js';
import { getDeal } from './getDeal.js';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown> | unknown;

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: ToolHandler;
};

export const tools: ToolDefinition[] = [createDeal, getDeal];
