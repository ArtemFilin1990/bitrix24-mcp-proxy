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

const ensureBoolean = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'boolean') throw new BadRequestError(message);
  return value;
};

const ensureArray = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new BadRequestError(message);
  return value;
};

export const leadTools = [
  {
    name: 'bitrix_lead_list',
    description: 'Получить список лидов с возможностью фильтрации.',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (STATUS_ID, ASSIGNED_BY_ID и др.)', optional: true },
      select: { type: 'array', description: 'Список полей для выборки', optional: true },
      order: { type: 'object', description: 'Сортировка', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_lead_get',
    description: 'Получить лид по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID лида' },
    },
  },
  {
    name: 'bitrix_lead_add',
    description: 'Создать новый лид.',
    parameters: {
      fields: { type: 'object', description: 'Поля лида (обязательно TITLE)' },
    },
  },
  {
    name: 'bitrix_lead_update',
    description: 'Обновить существующий лид.',
    parameters: {
      id: { type: 'number', description: 'ID лида' },
      fields: { type: 'object', description: 'Поля для обновления.' },
    },
  },
  {
    name: 'bitrix_lead_delete',
    description: 'Удалить лид по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID лида' },
    },
  },
  {
    name: 'bitrix_lead_fields',
    description: 'Получить описание полей лида.',
    parameters: {},
  },
  {
    name: 'bitrix_lead_convert',
    description: 'Конвертировать лид в сделку, контакт и/или компанию.',
    parameters: {
      id: { type: 'number', description: 'ID лида' },
      createDeal: { type: 'boolean', description: 'Создать сделку', optional: true },
      createContact: { type: 'boolean', description: 'Создать контакт', optional: true },
      createCompany: { type: 'boolean', description: 'Создать компанию', optional: true },
    },
  },
  {
    name: 'bitrix_lead_userfield_list',
    description: 'Получить пользовательские поля лидов.',
    parameters: {},
  },
];

export const buildLeadRequest = (toolName, args) => {
  switch (toolName) {
    case 'bitrix_lead_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const select = ensureArray(args.select, 'select must be an array') || ['*'];
      const order = ensureObject(args.order, 'order must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'crm.lead.list', payload: { filter, select, order, start } };
    }
    case 'bitrix_lead_get': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.lead.get', payload: { id } };
    }
    case 'bitrix_lead_add': {
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || !fields.TITLE) {
        throw new BadRequestError('fields.TITLE is required');
      }
      return { method: 'crm.lead.add', payload: { fields } };
    }
    case 'bitrix_lead_update': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('fields must include at least one field');
      }
      return { method: 'crm.lead.update', payload: { id, fields } };
    }
    case 'bitrix_lead_delete': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.lead.delete', payload: { id } };
    }
    case 'bitrix_lead_fields': {
      return { method: 'crm.lead.fields', payload: {} };
    }
    case 'bitrix_lead_convert': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const createDeal = ensureBoolean(args.createDeal, 'createDeal must be a boolean') ?? false;
      const createContact = ensureBoolean(args.createContact, 'createContact must be a boolean') ?? false;
      const createCompany = ensureBoolean(args.createCompany, 'createCompany must be a boolean') ?? false;
      return {
        method: 'crm.lead.convert',
        payload: {
          id,
          params: {
            CREATE_DEAL: createDeal ? 'Y' : 'N',
            CREATE_CONTACT: createContact ? 'Y' : 'N',
            CREATE_COMPANY: createCompany ? 'Y' : 'N',
          },
        },
      };
    }
    case 'bitrix_lead_userfield_list': {
      return { method: 'crm.lead.userfield.list', payload: {} };
    }
    default:
      return null;
  }
};
