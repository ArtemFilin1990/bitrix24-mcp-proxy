/**
 * Deal-related tools for Bitrix24 MCP
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

export const dealToolDefinitions: ToolDefinition[] = [
  {
    name: 'bitrix_get_deal',
    description: 'Получить сделку Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'Числовой ID сделки Bitrix24.' },
    },
  },
  {
    name: 'bitrix_create_deal',
    description: 'Создать новую сделку Bitrix24 с обязательным заголовком и дополнительными полями.',
    parameters: {
      title: { type: 'string', description: 'Название сделки.' },
      fields: {
        type: 'object',
        description: 'Дополнительные поля сделки (например, COMMENTS, OPPORTUNITY).',
        additionalProperties: true,
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_update_deal',
    description: 'Обновить существующую сделку Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'Числовой ID сделки Bitrix24.' },
      fields: {
        type: 'object',
        description: 'Поля сделки для обновления.',
        additionalProperties: true,
      },
    },
  },
  {
    name: 'bitrix_search_deals',
    description: 'Поиск сделок по фильтру (стадия, ответственный, дата, сумма).',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (STAGE_ID, ASSIGNED_BY_ID, >=OPPORTUNITY и др.).',
        optional: true,
      },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_list_deals',
    description: 'Получить список сделок с полной фильтрацией, сортировкой и пагинацией.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (STAGE_ID, CATEGORY_ID, ASSIGNED_BY_ID, >=OPPORTUNITY и др.).',
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
    name: 'bitrix_get_deal_categories',
    description: 'Получить список воронок продаж (категорий сделок).',
    parameters: {},
  },
  {
    name: 'bitrix_get_deal_stages',
    description: 'Получить стадии сделок для указанной воронки продаж.',
    parameters: {
      categoryId: {
        type: 'number',
        description: 'ID воронки (категории). 0 для стандартной воронки.',
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_filter_deals_by_pipeline',
    description: 'Фильтрация сделок по воронке продаж.',
    parameters: {
      categoryId: { type: 'number', description: 'ID воронки (категории).' },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_filter_deals_by_budget',
    description: 'Фильтрация сделок по бюджету (минимальный и/или максимальный).',
    parameters: {
      minBudget: { type: 'number', description: 'Минимальный бюджет сделки.', optional: true },
      maxBudget: { type: 'number', description: 'Максимальный бюджет сделки.', optional: true },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_filter_deals_by_status',
    description: 'Фильтрация сделок по статусу/стадии.',
    parameters: {
      stageId: { type: 'string', description: 'ID стадии сделки (например, "NEW", "WON", "LOSE").' },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_get_latest_deals',
    description: 'Получить последние сделки, отсортированные по дате создания.',
    parameters: {
      limit: { type: 'number', description: 'Количество сделок (по умолчанию 10).', optional: true },
    },
  },
  {
    name: 'bitrix_get_deal_fields',
    description: 'Получить список полей сделки с описанием и типами.',
    parameters: {},
  },
];

export const buildDealRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  if (toolName === 'bitrix_get_deal') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.deal.get', payload: { id } };
  }

  if (toolName === 'bitrix_create_deal') {
    const title = ensureString(args.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object when provided');
    const payloadFields = { TITLE: title, ...(fields || {}) };
    return { method: 'crm.deal.add', payload: { fields: payloadFields } };
  }

  if (toolName === 'bitrix_update_deal') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object');
    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }
    return { method: 'crm.deal.update', payload: { id, fields } };
  }

  if (toolName === 'bitrix_search_deals') {
    const filter =
      ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided') || {};
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.deal.list', payload: { filter, start: 0, limit } };
  }

  if (toolName === 'bitrix_list_deals') {
    const filter = ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided');
    const order = ensureObject<Record<string, unknown>>(args.order, 'Parameter "order" must be an object when provided');
    const start = getOptionalPositiveNumber(args.start, 0) || 0;
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.deal.list', payload: createListPayload(filter, order, start, limit) };
  }

  if (toolName === 'bitrix_get_deal_categories') {
    return { method: 'crm.dealcategory.list', payload: {} };
  }

  if (toolName === 'bitrix_get_deal_stages') {
    const categoryId = typeof args.categoryId === 'number' ? args.categoryId : 0;
    return { method: 'crm.dealcategory.stage.list', payload: { id: categoryId } };
  }

  if (toolName === 'bitrix_filter_deals_by_pipeline') {
    const categoryId = ensurePositiveNumber(args.categoryId, 'Parameter "categoryId" must be a positive number');
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.deal.list', payload: { filter: { CATEGORY_ID: categoryId }, start: 0, limit } };
  }

  if (toolName === 'bitrix_filter_deals_by_budget') {
    const minBudget = typeof args.minBudget === 'number' ? args.minBudget : undefined;
    const maxBudget = typeof args.maxBudget === 'number' ? args.maxBudget : undefined;

    if (minBudget === undefined && maxBudget === undefined) {
      throw new BadRequestError('At least one of "minBudget" or "maxBudget" must be provided');
    }

    const filter: Record<string, unknown> = {};
    if (minBudget !== undefined) {
      filter['>=OPPORTUNITY'] = minBudget;
    }
    if (maxBudget !== undefined) {
      filter['<=OPPORTUNITY'] = maxBudget;
    }

    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.deal.list', payload: { filter, start: 0, limit } };
  }

  if (toolName === 'bitrix_filter_deals_by_status') {
    const stageId = ensureString(args.stageId, 'Parameter "stageId" must be a non-empty string');
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.deal.list', payload: { filter: { STAGE_ID: stageId }, start: 0, limit } };
  }

  if (toolName === 'bitrix_get_latest_deals') {
    const limit = getOptionalPositiveNumber(args.limit, 10);
    return {
      method: 'crm.deal.list',
      payload: { filter: {}, order: { DATE_CREATE: 'DESC' }, start: 0, limit },
    };
  }

  if (toolName === 'bitrix_get_deal_fields') {
    return { method: 'crm.deal.fields', payload: {} };
  }

  return null;
};
