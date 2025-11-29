import { dealTools, buildDealRequest } from './deals.js';
import { leadTools, buildLeadRequest } from './leads.js';
import { contactTools, buildContactRequest } from './contacts.js';
import { companyTools, buildCompanyRequest } from './companies.js';
import { itemTools, buildItemRequest } from './items.js';
import { activityTools, buildActivityRequest } from './activities.js';
import { taskTools, buildTaskRequest } from './tasks.js';
import { userTools, buildUserRequest } from './users.js';
import { miscTools, buildMiscRequest } from './misc.js';
import { BadRequestError } from '../errors.js';

export const allToolDefinitions = [
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

export const buildBitrixRequest = (toolName, args = {}) => {
  if (!toolName) {
    throw new BadRequestError('Tool name is required');
  }

  const normalizedArgs = typeof args === 'object' && !Array.isArray(args) ? args : {};

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
