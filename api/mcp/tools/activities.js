import { BadRequestError } from '../errors.js';

// Validation helpers
const ensureObject = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) throw new BadRequestError(message);
  return value;
};

const ensurePositiveNumber = (value, message) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) throw new BadRequestError(message);
  return value;
};

const ensureNumber = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) throw new BadRequestError(message);
  return value;
};

const ensureArray = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new BadRequestError(message);
  return value;
};

export const activityTools = [
  {
    name: 'bitrix_activity_list',
    description: 'Получить список активностей (звонки, встречи, письма, задачи CRM).',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (OWNER_TYPE_ID, OWNER_ID, TYPE_ID и др.)', optional: true },
      select: { type: 'array', description: 'Список полей для выборки', optional: true },
      order: { type: 'object', description: 'Сортировка', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_activity_get',
    description: 'Получить активность по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID активности' },
    },
  },
  {
    name: 'bitrix_activity_add',
    description: 'Создать активность (звонок, встреча, письмо, задача CRM).',
    parameters: {
      fields: { type: 'object', description: 'Поля активности (OWNER_TYPE_ID, OWNER_ID, TYPE_ID, SUBJECT и др.)' },
    },
  },
  {
    name: 'bitrix_activity_update',
    description: 'Обновить активность.',
    parameters: {
      id: { type: 'number', description: 'ID активности' },
      fields: { type: 'object', description: 'Поля для обновления.' },
    },
  },
  {
    name: 'bitrix_activity_delete',
    description: 'Удалить активность.',
    parameters: {
      id: { type: 'number', description: 'ID активности' },
    },
  },
  {
    name: 'bitrix_activity_fields',
    description: 'Получить описание полей активности.',
    parameters: {},
  },
];

export const buildActivityRequest = (toolName, args) => {
  switch (toolName) {
    case 'bitrix_activity_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const select = ensureArray(args.select, 'select must be an array') || ['*'];
      const order = ensureObject(args.order, 'order must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'crm.activity.list', payload: { filter, select, order, start } };
    }
    case 'bitrix_activity_get': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.activity.get', payload: { id } };
    }
    case 'bitrix_activity_add': {
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || !fields.OWNER_TYPE_ID || !fields.OWNER_ID || !fields.TYPE_ID) {
        throw new BadRequestError('fields.OWNER_TYPE_ID, fields.OWNER_ID and fields.TYPE_ID are required');
      }
      return { method: 'crm.activity.add', payload: { fields } };
    }
    case 'bitrix_activity_update': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('fields must include at least one field');
      }
      return { method: 'crm.activity.update', payload: { id, fields } };
    }
    case 'bitrix_activity_delete': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.activity.delete', payload: { id } };
    }
    case 'bitrix_activity_fields': {
      return { method: 'crm.activity.fields', payload: {} };
    }
    default:
      return null;
  }
};
