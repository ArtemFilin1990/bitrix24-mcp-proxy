/**
 * Main export file for all Bitrix24 MCP tools
 */

import { ToolDefinition, BitrixRequest } from './types.js';
import { BadRequestError } from './helpers.js';

// Import tool definitions from all modules
import { dealToolDefinitions, buildDealRequest } from './deals.js';
import { leadToolDefinitions, buildLeadRequest } from './leads.js';
import { contactToolDefinitions, buildContactRequest } from './contacts.js';
import { companyToolDefinitions, buildCompanyRequest } from './companies.js';
import { taskToolDefinitions, buildTaskRequest } from './tasks.js';
import { activityToolDefinitions, buildActivityRequest } from './activities.js';
import { userToolDefinitions, buildUserRequest } from './users.js';
import { utilToolDefinitions, buildUtilRequest } from './utils.js';

// Re-export types and helpers
export type { ToolDefinition, BitrixRequest } from './types.js';
export { BadRequestError } from './helpers.js';

// Combine all tool definitions
export const toolDefinitions: ToolDefinition[] = [
  ...dealToolDefinitions,
  ...contactToolDefinitions,
  ...companyToolDefinitions,
  ...leadToolDefinitions,
  ...taskToolDefinitions,
  ...activityToolDefinitions,
  ...userToolDefinitions,
  ...utilToolDefinitions,
];

// Alias for backward compatibility
export const tools = toolDefinitions;

// Build request handlers in order
const requestBuilders = [
  buildDealRequest,
  buildLeadRequest,
  buildContactRequest,
  buildCompanyRequest,
  buildTaskRequest,
  buildActivityRequest,
  buildUserRequest,
  buildUtilRequest,
];

/**
 * Build Bitrix24 API request from tool name and arguments
 */
export const buildBitrixRequest = (toolName: string, args: Record<string, unknown> = {}): BitrixRequest => {
  if (!toolName) {
    throw new BadRequestError('Tool name is required');
  }

  const normalizedArgs = typeof args === 'object' && !Array.isArray(args) ? args : {};

  // Try each request builder in order
  for (const builder of requestBuilders) {
    const result = builder(toolName, normalizedArgs);
    if (result) {
      return result;
    }
  }

  throw new BadRequestError(`Unknown tool: ${toolName}`);
};

// Get list of all tool names
export const getToolNames = (): string[] => {
  return toolDefinitions.map((tool) => tool.name);
};

// Get tool by name
export const getToolByName = (name: string): ToolDefinition | undefined => {
  return toolDefinitions.find((tool) => tool.name === name);
};
