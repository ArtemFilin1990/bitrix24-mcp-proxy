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
  if (typeof value !== 'number' || Number.isNaN(value)) throw new BadRequestError(message);
  return value;
};

const ensureArray = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new BadRequestError(message);
  return value;
};

export const companyTools = [
  {
    name: 'bitrix_company_list',
    description: 'Получить список компаний с возможностью фильтрации.',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (ASSIGNED_BY_ID, COMPANY_TYPE и др.)', optional: true },
      select: { type: 'array', description: 'Список полей для выборки', optional: true },
      order: { type: 'object', description: 'Сортировка', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_company_get',
    description: 'Получить компанию по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID компании' },
    },
  },
  {
    name: 'bitrix_company_add',
    description: 'Создать новую компанию.',
    parameters: {
      fields: { type: 'object', description: 'Поля компании (обязательно TITLE)' },
    },
  },
  {
    name: 'bitrix_company_update',
    description: 'Обновить существующую компанию.',
    parameters: {
      id: { type: 'number', description: 'ID компании' },
      fields: { type: 'object', description: 'Поля для обновления.' },
    },
  },
  {
    name: 'bitrix_company_delete',
    description: 'Удалить компанию по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID компании' },
    },
  },
  {
    name: 'bitrix_company_fields',
    description: 'Получить описание полей компании.',
    parameters: {},
  },
];

export const buildCompanyRequest = (toolName, args) => {
  switch (toolName) {
    case 'bitrix_company_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const select = ensureArray(args.select, 'select must be an array') || ['*'];
      const order = ensureObject(args.order, 'order must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'crm.company.list', payload: { filter, select, order, start } };
    }
    case 'bitrix_company_get': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.company.get', payload: { id } };
    }
    case 'bitrix_company_add': {
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || !fields.TITLE) {
        throw new BadRequestError('fields.TITLE is required');
      }
      return { method: 'crm.company.add', payload: { fields } };
    }
    case 'bitrix_company_update': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('fields must include at least one field');
      }
      return { method: 'crm.company.update', payload: { id, fields } };
    }
    case 'bitrix_company_delete': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.company.delete', payload: { id } };
    }
    case 'bitrix_company_fields': {
      return { method: 'crm.company.fields', payload: {} };
    }
    default:
      return null;
  }
};
