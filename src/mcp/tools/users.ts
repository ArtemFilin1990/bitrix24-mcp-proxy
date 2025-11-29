/**
 * User-related tools for Bitrix24 MCP
 */

import { ToolDefinition, BitrixRequest } from './types.js';
import {
  ensurePositiveNumber,
  ensureObject,
  ensureISODate,
  getOptionalPositiveNumber,
} from './helpers.js';

export const userToolDefinitions: ToolDefinition[] = [
  {
    name: 'bitrix_list_users',
    description: 'Получить список пользователей Bitrix24.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (ACTIVE, EMAIL и др.).',
        optional: true,
      },
      start: { type: 'number', description: 'Начальная позиция для пагинации (по умолчанию 0).', optional: true },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_get_user',
    description: 'Получить пользователя Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID пользователя.' },
    },
  },
  {
    name: 'bitrix_get_current_user',
    description: 'Получить информацию о текущем пользователе (владельце webhook).',
    parameters: {},
  },
  {
    name: 'bitrix_get_user_activity',
    description: 'Получить активности пользователя за указанный период.',
    parameters: {
      userId: { type: 'number', description: 'ID пользователя.' },
      dateFrom: { type: 'string', description: 'Начальная дата в формате ISO 8601 (YYYY-MM-DD).', optional: true },
      dateTo: { type: 'string', description: 'Конечная дата в формате ISO 8601 (YYYY-MM-DD).', optional: true },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
];

export const buildUserRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  if (toolName === 'bitrix_list_users') {
    const filter = ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided');
    const start = getOptionalPositiveNumber(args.start, 0) || 0;

    const payload: Record<string, unknown> = { start };
    if (filter) {
      // user.get uses different filter format
      Object.entries(filter).forEach(([key, value]) => {
        payload[key] = value;
      });
    }

    return { method: 'user.get', payload };
  }

  if (toolName === 'bitrix_get_user') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'user.get', payload: { ID: id } };
  }

  if (toolName === 'bitrix_get_current_user') {
    return { method: 'user.current', payload: {} };
  }

  if (toolName === 'bitrix_get_user_activity') {
    const userId = ensurePositiveNumber(args.userId, 'Parameter "userId" must be a positive number');
    const dateFrom = ensureISODate(args.dateFrom, 'Parameter "dateFrom" must be a valid ISO date string');
    const dateTo = ensureISODate(args.dateTo, 'Parameter "dateTo" must be a valid ISO date string');
    const limit = getOptionalPositiveNumber(args.limit, 50);

    const filter: Record<string, unknown> = {
      RESPONSIBLE_ID: userId,
    };

    if (dateFrom) {
      filter['>=START_TIME'] = dateFrom;
    }
    if (dateTo) {
      filter['<=START_TIME'] = dateTo;
    }

    return {
      method: 'crm.activity.list',
      payload: { filter, start: 0, limit },
    };
  }

  return null;
};
