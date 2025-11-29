/**
 * Lead-related tools for Bitrix24 MCP
 */

import { ToolDefinition, BitrixRequest } from './types.js';
import {
  BadRequestError,
  ensurePositiveNumber,
  ensureString,
  ensureObject,
  ensureISODate,
  getOptionalPositiveNumber,
  createListPayload,
} from './helpers.js';

export const leadToolDefinitions: ToolDefinition[] = [
  {
    name: 'bitrix_create_lead',
    description: 'Создать новый лид в Bitrix24.',
    parameters: {
      title: { type: 'string', description: 'Название лида.' },
      fields: {
        type: 'object',
        description: 'Дополнительные поля (PHONE, EMAIL, SOURCE_ID и др.).',
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_get_lead',
    description: 'Получить лид Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID лида.' },
    },
  },
  {
    name: 'bitrix_update_lead',
    description: 'Обновить существующий лид в Bitrix24.',
    parameters: {
      id: { type: 'number', description: 'ID лида.' },
      fields: {
        type: 'object',
        description: 'Поля лида для обновления.',
        additionalProperties: true,
      },
    },
  },
  {
    name: 'bitrix_list_leads',
    description: 'Получить список лидов с фильтрацией и сортировкой.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (STATUS_ID, ASSIGNED_BY_ID, SOURCE_ID и др.).',
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
    name: 'bitrix_search_leads',
    description: 'Поиск лидов по фильтру.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (STATUS_ID, ASSIGNED_BY_ID, TITLE и др.).',
        optional: true,
      },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_get_lead_statuses',
    description: 'Получить список статусов лидов.',
    parameters: {},
  },
  {
    name: 'bitrix_get_latest_leads',
    description: 'Получить последние лиды, отсортированные по дате создания.',
    parameters: {
      limit: { type: 'number', description: 'Количество лидов (по умолчанию 10).', optional: true },
    },
  },
  {
    name: 'bitrix_get_leads_from_date_range',
    description: 'Получить лиды за указанный период времени.',
    parameters: {
      dateFrom: { type: 'string', description: 'Начальная дата в формате ISO 8601 (YYYY-MM-DD).' },
      dateTo: { type: 'string', description: 'Конечная дата в формате ISO 8601 (YYYY-MM-DD).' },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_get_lead_fields',
    description: 'Получить список полей лида с описанием и типами.',
    parameters: {},
  },
];

export const buildLeadRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  if (toolName === 'bitrix_create_lead') {
    const title = ensureString(args.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object when provided');
    return { method: 'crm.lead.add', payload: { fields: { TITLE: title, ...(fields || {}) } } };
  }

  if (toolName === 'bitrix_get_lead') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.lead.get', payload: { id } };
  }

  if (toolName === 'bitrix_update_lead') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object');
    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }
    return { method: 'crm.lead.update', payload: { id, fields } };
  }

  if (toolName === 'bitrix_list_leads') {
    const filter = ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided');
    const order = ensureObject<Record<string, unknown>>(args.order, 'Parameter "order" must be an object when provided');
    const start = getOptionalPositiveNumber(args.start, 0) || 0;
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.lead.list', payload: createListPayload(filter, order, start, limit) };
  }

  if (toolName === 'bitrix_search_leads') {
    const filter =
      ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided') || {};
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.lead.list', payload: { filter, start: 0, limit } };
  }

  if (toolName === 'bitrix_get_lead_statuses') {
    return { method: 'crm.status.list', payload: { filter: { ENTITY_ID: 'STATUS' } } };
  }

  if (toolName === 'bitrix_get_latest_leads') {
    const limit = getOptionalPositiveNumber(args.limit, 10);
    return {
      method: 'crm.lead.list',
      payload: { filter: {}, order: { DATE_CREATE: 'DESC' }, start: 0, limit },
    };
  }

  if (toolName === 'bitrix_get_leads_from_date_range') {
    const dateFrom = ensureISODate(args.dateFrom, 'Parameter "dateFrom" must be a valid ISO date string');
    const dateTo = ensureISODate(args.dateTo, 'Parameter "dateTo" must be a valid ISO date string');

    if (!dateFrom || !dateTo) {
      throw new BadRequestError('Both "dateFrom" and "dateTo" are required');
    }

    const limit = getOptionalPositiveNumber(args.limit, 50);
    return {
      method: 'crm.lead.list',
      payload: {
        filter: {
          '>=DATE_CREATE': dateFrom,
          '<=DATE_CREATE': dateTo,
        },
        order: { DATE_CREATE: 'DESC' },
        start: 0,
        limit,
      },
    };
  }

  if (toolName === 'bitrix_get_lead_fields') {
    return { method: 'crm.lead.fields', payload: {} };
  }

  return null;
};
