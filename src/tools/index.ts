import { createLogger } from '../utils/logger.js';

const logger = createLogger('Tools');

/**
 * Tool definition interface
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * List deals tool
 */
const listDealsTool: Tool = {
  name: 'list_deals',
  description: 'List CRM deals from Bitrix24',
  inputSchema: {
    type: 'object',
    properties: {
      filter: {
        type: 'object',
        description: 'Filter criteria for deals',
      },
      select: {
        type: 'array',
        items: { type: 'string' },
        description: 'Fields to select',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of deals to return',
      },
    },
  },
  handler: async (params) => {
    logger.debug({ params }, 'Listing deals');
    // Placeholder implementation
    return { deals: [], total: 0 };
  },
};

/**
 * Get deal tool
 */
const getDealTool: Tool = {
  name: 'get_deal',
  description: 'Get a specific CRM deal by ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Deal ID',
      },
    },
    required: ['id'],
  },
  handler: async (params) => {
    logger.debug({ params }, 'Getting deal');
    // Placeholder implementation
    return { deal: null };
  },
};

/**
 * Available tools map
 */
export const tools: Record<string, Tool> = {
  list_deals: listDealsTool,
  get_deal: getDealTool,
};

/**
 * Get a tool by name
 */
export function getTool(name: string): Tool | undefined {
  return tools[name];
}

/**
 * List all available tools
 */
export function listTools(): Tool[] {
  return Object.values(tools);
}
