import { dealTools, buildDealRequest } from './deals.js';
import { leadTools, buildLeadRequest } from './leads.js';
import { contactTools, buildContactRequest } from './contacts.js';
import { companyTools, buildCompanyRequest } from './companies.js';
import { itemTools, buildItemRequest } from './items.js';
import { activityTools, buildActivityRequest } from './activities.js';
import { taskTools, buildTaskRequest } from './tasks.js';
import { userTools, buildUserRequest } from './users.js';
import { miscTools, buildMiscRequest } from './misc.js';
import { ToolDefinition } from '../types.js';
import { BadRequestError } from '../validation.js';

export const allToolDefinitions: ToolDefinition[] = [
  ...dealTools,
  ...leadTools,
  ...contactTools,
  ...companyTools,
  ...itemTools,
  ...activityTools,
  ...taskTools,
  ...userTools,
  ...miscTools,
];

export const buildBitrixRequest = (toolName: string, args: Record<string, unknown> = {}) => {
  if (!toolName) {
    throw new BadRequestError('Tool name is required');
  }

  const normalizedArgs = typeof args === 'object' && !Array.isArray(args) ? args : {};

  // Try each builder in order
  const builders = [
    buildDealRequest,
    buildLeadRequest,
    buildContactRequest,
    buildCompanyRequest,
    buildItemRequest,
    buildActivityRequest,
    buildTaskRequest,
    buildUserRequest,
    buildMiscRequest,
  ];

  for (const builder of builders) {
    const result = builder(toolName, normalizedArgs);
    if (result) {
      return result;
    }
  }

  throw new BadRequestError(`Unknown tool: ${toolName}`);
};

export { BadRequestError };
