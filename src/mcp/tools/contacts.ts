import { ToolDefinition } from '../types.js';
import { BadRequestError, ensurePositiveNumber, ensureObject, ensureNumber, ensureArray, ensureString } from '../validation.js';

export const contactTools: ToolDefinition[] = [
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
      fields: {
        type: 'object',
        description: 'Поля контакта (NAME, LAST_NAME, PHONE, EMAIL и др.)',
      },
    },
  },
  {
    name: 'bitrix_contact_update',
    description: 'Обновить существующий контакт.',
    parameters: {
      id: { type: 'number', description: 'ID контакта' },
      fields: {
        type: 'object',
        description: 'Поля для обновления.',
      },
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

export const buildContactRequest = (toolName: string, args: Record<string, unknown>) => {
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
      const fields = ensureObject<Record<string, unknown>>(args.fields, 'fields must be an object');
      if (!fields) {
        throw new BadRequestError('fields is required');
      }
      return { method: 'crm.contact.add', payload: { fields } };
    }
    case 'bitrix_create_contact': {
      const firstName = ensureString(args.firstName, 'firstName must be a non-empty string');
      const lastName = ensureString(args.lastName, 'lastName must be a non-empty string');
      const email = ensureString(args.email, 'email must be a non-empty string');
      const phone = ensureString(args.phone, 'phone must be a non-empty string');

      const fields: Record<string, unknown> = {};

      if (firstName) {
        fields.NAME = firstName;
      }

      if (lastName) {
        fields.LAST_NAME = lastName;
      }

      if (email) {
        fields.EMAIL = [{ VALUE: email, VALUE_TYPE: 'WORK' }];
      }

      if (phone) {
        fields.PHONE = [{ VALUE: phone, VALUE_TYPE: 'WORK' }];
      }

      if (Object.keys(fields).length === 0) {
        throw new BadRequestError('At least one field is required to create contact');
      }

      return { method: 'crm.contact.add', payload: { fields } };
    }
    case 'bitrix_update_contact': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const fields = ensureObject(args.fields, 'Parameter "fields" must include at least one field');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('Parameter "fields" must include at least one field');
      }
      return { method: 'crm.contact.update', payload: { id, fields } };
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
    case 'bitrix_find_contact': {
      const phone = ensureString(args.phone, 'phone must be a non-empty string');
      const email = ensureString(args.email, 'email must be a non-empty string');

      if (!phone && !email) {
        throw new BadRequestError('phone or email is required');
      }

      const filter = phone ? { PHONE: phone } : { EMAIL: email };
      return {
        method: 'crm.contact.list',
        payload: { filter, select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'] },
      };
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
