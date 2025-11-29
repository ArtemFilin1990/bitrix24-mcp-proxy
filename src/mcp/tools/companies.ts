/**
 * Company-related tools for Bitrix24 MCP
 */

import { ToolDefinition, BitrixRequest } from './types.js';
import {
  BadRequestError,
  ensurePositiveNumber,
  ensureString,
  ensureObject,
  getOptionalPositiveNumber,
  createListPayload,
} from './helpers.js';

export const companyToolDefinitions: ToolDefinition[] = [
  {
    name: 'bitrix_create_company',
    description: 'Создать новую компанию в Bitrix24.',
    parameters: {
      title: { type: 'string', description: 'Название компании.' },
      fields: {
        type: 'object',
        description: 'Дополнительные поля (PHONE, EMAIL, ADDRESS и др.).',
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_get_company',
    description: 'Получить компанию Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID компании.' },
    },
  },
  {
    name: 'bitrix_update_company',
    description: 'Обновить существующую компанию в Bitrix24.',
    parameters: {
      id: { type: 'number', description: 'ID компании.' },
      fields: {
        type: 'object',
        description: 'Поля компании для обновления.',
        additionalProperties: true,
      },
    },
  },
  {
    name: 'bitrix_list_companies',
    description: 'Получить список компаний с фильтрацией и сортировкой.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (TITLE, COMPANY_TYPE, INDUSTRY и др.).',
        optional: true,
      },
      order: {
        type: 'object',
        description: 'Сортировка (например, {DATE_CREATE: "DESC"}).',
        optional: true,
      },
      start: { type: 'number', description: 'Начальная позиция для пагинации (по умолчанию 0).', optional: true },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_search_companies',
    description: 'Поиск компаний по названию.',
    parameters: {
      query: { type: 'string', description: 'Поисковый запрос (название компании).' },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_get_latest_companies',
    description: 'Получить последние компании, отсортированные по дате создания.',
    parameters: {
      limit: { type: 'number', description: 'Количество компаний (по умолчанию 10).', optional: true },
    },
  },
  {
    name: 'bitrix_get_company_fields',
    description: 'Получить список полей компании с описанием и типами.',
    parameters: {},
  },
];

export const buildCompanyRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  if (toolName === 'bitrix_create_company') {
    const title = ensureString(args.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object when provided');
    return { method: 'crm.company.add', payload: { fields: { TITLE: title, ...(fields || {}) } } };
  }

  if (toolName === 'bitrix_get_company') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.company.get', payload: { id } };
  }

  if (toolName === 'bitrix_update_company') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object');
    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }
    return { method: 'crm.company.update', payload: { id, fields } };
  }

  if (toolName === 'bitrix_list_companies') {
    const filter = ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided');
    const order = ensureObject<Record<string, unknown>>(args.order, 'Parameter "order" must be an object when provided');
    const start = getOptionalPositiveNumber(args.start, 0) || 0;
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.company.list', payload: createListPayload(filter, order, start, limit) };
  }

  if (toolName === 'bitrix_search_companies') {
    const query = ensureString(args.query, 'Parameter "query" must be a non-empty string');
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return {
      method: 'crm.company.list',
      payload: { filter: { '%TITLE': query }, start: 0, limit },
    };
  }

  if (toolName === 'bitrix_get_latest_companies') {
    const limit = getOptionalPositiveNumber(args.limit, 10);
    return {
      method: 'crm.company.list',
      payload: { filter: {}, order: { DATE_CREATE: 'DESC' }, start: 0, limit },
    };
  }

  if (toolName === 'bitrix_get_company_fields') {
    return { method: 'crm.company.fields', payload: {} };
  }

  return null;
};
