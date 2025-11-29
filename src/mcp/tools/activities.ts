/**
 * Activity-related tools for Bitrix24 MCP
 */

import { ToolDefinition, BitrixRequest, ENTITY_TYPE_IDS } from './types.js';
import {
  BadRequestError,
  ensurePositiveNumber,
  ensureString,
  ensureObject,
  getOptionalPositiveNumber,
  createListPayload,
} from './helpers.js';

export const activityToolDefinitions: ToolDefinition[] = [
  {
    name: 'bitrix_create_activity',
    description: 'Создать новую активность (звонок, встреча, письмо и т.д.) в Bitrix24.',
    parameters: {
      ownerType: {
        type: 'string',
        description: 'Тип владельца активности: lead, deal, contact, company.',
        enum: ['lead', 'deal', 'contact', 'company'],
      },
      ownerId: { type: 'number', description: 'ID сущности-владельца.' },
      typeId: {
        type: 'number',
        description: 'Тип активности: 1 - встреча, 2 - звонок, 3 - письмо, 4 - задача, 6 - email.',
      },
      subject: { type: 'string', description: 'Тема активности.' },
      description: { type: 'string', description: 'Описание активности.', optional: true },
      responsibleId: { type: 'number', description: 'ID ответственного пользователя.', optional: true },
      startTime: { type: 'string', description: 'Время начала в формате ISO 8601.', optional: true },
      endTime: { type: 'string', description: 'Время окончания в формате ISO 8601.', optional: true },
      fields: {
        type: 'object',
        description: 'Дополнительные поля активности.',
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_get_activity',
    description: 'Получить активность Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID активности.' },
    },
  },
  {
    name: 'bitrix_list_activities',
    description: 'Получить список активностей с фильтрацией.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (OWNER_ID, OWNER_TYPE_ID, TYPE_ID, COMPLETED, RESPONSIBLE_ID и др.).',
        optional: true,
      },
      order: {
        type: 'object',
        description: 'Сортировка (например, {START_TIME: "DESC"}).',
        optional: true,
      },
      start: { type: 'number', description: 'Начальная позиция для пагинации (по умолчанию 0).', optional: true },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_update_activity',
    description: 'Обновить существующую активность в Bitrix24.',
    parameters: {
      id: { type: 'number', description: 'ID активности.' },
      fields: {
        type: 'object',
        description: 'Поля активности для обновления.',
        additionalProperties: true,
      },
    },
  },
  {
    name: 'bitrix_complete_activity',
    description: 'Завершить активность (отметить как выполненную).',
    parameters: {
      id: { type: 'number', description: 'ID активности.' },
    },
  },
];

const getOwnerTypeId = (ownerType: string): number => {
  const typeId = ENTITY_TYPE_IDS[ownerType.toLowerCase()];
  if (!typeId) {
    throw new BadRequestError('Parameter "ownerType" must be one of: lead, deal, contact, company');
  }
  return typeId;
};

export const buildActivityRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  if (toolName === 'bitrix_create_activity') {
    const ownerType = ensureString(args.ownerType, 'Parameter "ownerType" must be a non-empty string');
    const ownerId = ensurePositiveNumber(args.ownerId, 'Parameter "ownerId" must be a positive number');
    const typeId = ensurePositiveNumber(args.typeId, 'Parameter "typeId" must be a positive number');
    const subject = ensureString(args.subject, 'Parameter "subject" must be a non-empty string');
    const description = ensureString(args.description, 'Parameter "description" must be a non-empty string when provided');
    const responsibleId = typeof args.responsibleId === 'number' ? args.responsibleId : undefined;
    const startTime = ensureString(args.startTime, 'Parameter "startTime" must be a non-empty string when provided');
    const endTime = ensureString(args.endTime, 'Parameter "endTime" must be a non-empty string when provided');
    const additionalFields = ensureObject<Record<string, unknown>>(
      args.fields,
      'Parameter "fields" must be an object when provided'
    );

    const ownerTypeId = getOwnerTypeId(ownerType!);

    const fields: Record<string, unknown> = {
      OWNER_TYPE_ID: ownerTypeId,
      OWNER_ID: ownerId,
      TYPE_ID: typeId,
      SUBJECT: subject,
      ...(additionalFields || {}),
    };

    if (description) {
      fields['DESCRIPTION'] = description;
    }
    if (responsibleId !== undefined) {
      fields['RESPONSIBLE_ID'] = responsibleId;
    }
    if (startTime) {
      fields['START_TIME'] = startTime;
    }
    if (endTime) {
      fields['END_TIME'] = endTime;
    }

    return { method: 'crm.activity.add', payload: { fields } };
  }

  if (toolName === 'bitrix_get_activity') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.activity.get', payload: { id } };
  }

  if (toolName === 'bitrix_list_activities') {
    const filter = ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided');
    const order = ensureObject<Record<string, unknown>>(args.order, 'Parameter "order" must be an object when provided');
    const start = getOptionalPositiveNumber(args.start, 0) || 0;
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.activity.list', payload: createListPayload(filter, order, start, limit) };
  }

  if (toolName === 'bitrix_update_activity') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object');
    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }
    return { method: 'crm.activity.update', payload: { id, fields } };
  }

  if (toolName === 'bitrix_complete_activity') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.activity.update', payload: { id, fields: { COMPLETED: 'Y' } } };
  }

  return null;
};
