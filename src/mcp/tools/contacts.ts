/**
 * Contact-related tools for Bitrix24 MCP
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

export const contactToolDefinitions: ToolDefinition[] = [
  {
    name: 'bitrix_find_contact',
    description: 'Найти контакт Bitrix24 по телефону или email.',
    parameters: {
      phone: { type: 'string', description: 'Номер телефона в международном формате.', optional: true },
      email: { type: 'string', description: 'Email контакта.', optional: true },
    },
  },
  {
    name: 'bitrix_create_contact',
    description: 'Создать новый контакт Bitrix24.',
    parameters: {
      firstName: { type: 'string', description: 'Имя контакта.' },
      lastName: { type: 'string', description: 'Фамилия контакта.', optional: true },
      phone: { type: 'string', description: 'Номер телефона.', optional: true },
      email: { type: 'string', description: 'Email контакта.', optional: true },
    },
  },
  {
    name: 'bitrix_update_contact',
    description: 'Обновить существующий контакт Bitrix24.',
    parameters: {
      id: { type: 'number', description: 'Числовой ID контакта.' },
      fields: {
        type: 'object',
        description: 'Поля контакта для обновления.',
        additionalProperties: true,
      },
    },
  },
  {
    name: 'bitrix_get_contact',
    description: 'Получить контакт Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'Числовой ID контакта.' },
    },
  },
  {
    name: 'bitrix_list_contacts',
    description: 'Получить список контактов с фильтрацией и сортировкой.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (NAME, LAST_NAME, PHONE, EMAIL, COMPANY_ID и др.).',
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
    name: 'bitrix_search_contacts',
    description: 'Поиск контактов по имени, телефону или email.',
    parameters: {
      query: { type: 'string', description: 'Поисковый запрос (имя, телефон или email).', optional: true },
      name: { type: 'string', description: 'Имя контакта для поиска.', optional: true },
      phone: { type: 'string', description: 'Телефон для поиска.', optional: true },
      email: { type: 'string', description: 'Email для поиска.', optional: true },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_get_contact_fields',
    description: 'Получить список полей контакта с описанием и типами.',
    parameters: {},
  },
];

export const buildContactRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  if (toolName === 'bitrix_find_contact') {
    const phone = ensureString(args.phone, 'Parameter "phone" must be a non-empty string when provided');
    const email = ensureString(args.email, 'Parameter "email" must be a non-empty string when provided');

    if (!phone && !email) {
      throw new BadRequestError('Either "phone" or "email" must be provided');
    }

    const filter: Record<string, unknown> = {};
    if (phone) {
      filter['PHONE'] = phone;
    }
    if (email) {
      filter['EMAIL'] = email;
    }

    return {
      method: 'crm.contact.list',
      payload: {
        filter,
        select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
      },
    };
  }

  if (toolName === 'bitrix_create_contact') {
    const firstName = ensureString(args.firstName, 'Parameter "firstName" must be a non-empty string');
    const lastName = ensureString(args.lastName, 'Parameter "lastName" must be a non-empty string when provided');
    const phone = ensureString(args.phone, 'Parameter "phone" must be a non-empty string when provided');
    const email = ensureString(args.email, 'Parameter "email" must be a non-empty string when provided');

    const fields: Record<string, unknown> = { NAME: firstName };

    if (lastName) {
      fields['LAST_NAME'] = lastName;
    }
    if (phone) {
      fields['PHONE'] = [{ VALUE: phone, VALUE_TYPE: 'WORK' }];
    }
    if (email) {
      fields['EMAIL'] = [{ VALUE: email, VALUE_TYPE: 'WORK' }];
    }

    return { method: 'crm.contact.add', payload: { fields } };
  }

  if (toolName === 'bitrix_update_contact') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object');

    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }

    return { method: 'crm.contact.update', payload: { id, fields } };
  }

  if (toolName === 'bitrix_get_contact') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.contact.get', payload: { id } };
  }

  if (toolName === 'bitrix_list_contacts') {
    const filter = ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided');
    const order = ensureObject<Record<string, unknown>>(args.order, 'Parameter "order" must be an object when provided');
    const start = getOptionalPositiveNumber(args.start, 0) || 0;
    const limit = getOptionalPositiveNumber(args.limit, 50);
    return { method: 'crm.contact.list', payload: createListPayload(filter, order, start, limit) };
  }

  if (toolName === 'bitrix_search_contacts') {
    const query = ensureString(args.query, 'Parameter "query" must be a non-empty string when provided');
    const name = ensureString(args.name, 'Parameter "name" must be a non-empty string when provided');
    const phone = ensureString(args.phone, 'Parameter "phone" must be a non-empty string when provided');
    const email = ensureString(args.email, 'Parameter "email" must be a non-empty string when provided');

    if (!query && !name && !phone && !email) {
      throw new BadRequestError('At least one search parameter (query, name, phone, or email) must be provided');
    }

    const filter: Record<string, unknown> = {};
    if (query) {
      // Use query as a name search (partial match)
      filter['%NAME'] = query;
    }
    if (name) {
      filter['%NAME'] = name;
    }
    if (phone) {
      filter['PHONE'] = phone;
    }
    if (email) {
      filter['EMAIL'] = email;
    }

    const limit = getOptionalPositiveNumber(args.limit, 50);
    return {
      method: 'crm.contact.list',
      payload: { filter, start: 0, limit },
    };
  }

  if (toolName === 'bitrix_get_contact_fields') {
    return { method: 'crm.contact.fields', payload: {} };
  }

  return null;
};
