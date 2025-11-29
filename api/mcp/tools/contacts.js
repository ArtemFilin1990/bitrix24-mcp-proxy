import { BadRequestError } from '../errors.js';

// Validation helpers
const ensureObject = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) throw new BadRequestError(message);
  return value;
};

const ensureString = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) throw new BadRequestError(message);
  return value.trim();
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

export const contactTools = [
  {
    name: 'bitrix_contact_list',
    description: 'Получить список контактов с возможностью фильтрации.',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (ASSIGNED_BY_ID, COMPANY_ID и др.)', optional: true },
      select: { type: 'array', description: 'Список полей для выборки', optional: true },
      order: { type: 'object', description: 'Сортировка', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_contact_get',
    description: 'Получить контакт по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID контакта' },
    },
  },
  {
    name: 'bitrix_contact_add',
    description: 'Создать новый контакт.',
    parameters: {
      fields: { type: 'object', description: 'Поля контакта (NAME, LAST_NAME, PHONE, EMAIL и др.)' },
    },
  },
  {
    name: 'bitrix_contact_update',
    description: 'Обновить существующий контакт.',
    parameters: {
      id: { type: 'number', description: 'ID контакта' },
      fields: { type: 'object', description: 'Поля для обновления.' },
    },
  },
  {
    name: 'bitrix_contact_delete',
    description: 'Удалить контакт по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID контакта' },
    },
  },
  {
    name: 'bitrix_contact_fields',
    description: 'Получить описание полей контакта.',
    parameters: {},
  },
  {
    name: 'bitrix_contact_search_by_phone',
    description: 'Найти контакты по номеру телефона (поиск дубликатов).',
    parameters: {
      phone: { type: 'string', description: 'Номер телефона' },
    },
  },
];

export const buildContactRequest = (toolName, args) => {
  switch (toolName) {
    case 'bitrix_contact_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const select = ensureArray(args.select, 'select must be an array') || ['*'];
      const order = ensureObject(args.order, 'order must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'crm.contact.list', payload: { filter, select, order, start } };
    }
    case 'bitrix_contact_get': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.contact.get', payload: { id } };
    }
    case 'bitrix_contact_add': {
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields) {
        throw new BadRequestError('fields is required');
      }
      return { method: 'crm.contact.add', payload: { fields } };
    }
    case 'bitrix_contact_update': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('fields must include at least one field');
      }
      return { method: 'crm.contact.update', payload: { id, fields } };
    }
    case 'bitrix_contact_delete': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.contact.delete', payload: { id } };
    }
    case 'bitrix_contact_fields': {
      return { method: 'crm.contact.fields', payload: {} };
    }
    case 'bitrix_contact_search_by_phone': {
      const phone = ensureString(args.phone, 'phone must be a non-empty string');
      if (!phone) {
        throw new BadRequestError('phone is required');
      }
      return {
        method: 'crm.duplicate.findbycomm',
        payload: { type: 'PHONE', values: [phone], entity_type: 'CONTACT' },
      };
    }
    default:
      return null;
  }
};
