import { McpTool, ToolDefinition } from './types.js';

export class BadRequestError extends Error {
  statusCode = 400;
}

export const toolDefinitions: ToolDefinition[] = [
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
];

export const tools: McpTool[] = toolDefinitions;

const ensureObject = <T extends object>(value: unknown, message: string): T | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestError(message);
  }

  return value as T;
};

const ensureString = (value: unknown, message: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(message);
  }

  return value.trim();
};

const ensurePositiveNumber = (value: unknown, message: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new BadRequestError(message);
  }

  return value;
};

export const buildBitrixRequest = (toolName: string, args: Record<string, unknown> = {}) => {
  if (!toolName) {
    throw new BadRequestError('Tool name is required');
  }

  const normalizedArgs = typeof args === 'object' && !Array.isArray(args) ? args : {};

  if (toolName === 'bitrix_get_deal') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');

    return {
      method: 'crm.deal.get',
      payload: { id },
    } as const;
  }

  if (toolName === 'bitrix_create_deal') {
    const title = ensureString(normalizedArgs.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject<Record<string, unknown>>(normalizedArgs.fields, 'Parameter "fields" must be an object when provided');
    const payloadFields = { TITLE: title, ...(fields || {}) };

    return {
      method: 'crm.deal.add',
      payload: { fields: payloadFields },
    } as const;
  }

  if (toolName === 'bitrix_update_deal') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(normalizedArgs.fields, 'Parameter "fields" must be an object');

    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }

    return {
      method: 'crm.deal.update',
      payload: { id, fields },
    } as const;
  }

  if (toolName === 'bitrix_find_contact') {
    const phone = ensureString(normalizedArgs.phone, 'Parameter "phone" must be a non-empty string when provided');
    const email = ensureString(normalizedArgs.email, 'Parameter "email" must be a non-empty string when provided');

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
    } as const;
  }

  if (toolName === 'bitrix_create_contact') {
    const firstName = ensureString(normalizedArgs.firstName, 'Parameter "firstName" must be a non-empty string');
    const lastName = ensureString(normalizedArgs.lastName, 'Parameter "lastName" must be a non-empty string when provided');
    const phone = ensureString(normalizedArgs.phone, 'Parameter "phone" must be a non-empty string when provided');
    const email = ensureString(normalizedArgs.email, 'Parameter "email" must be a non-empty string when provided');

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

    return {
      method: 'crm.contact.add',
      payload: { fields },
    } as const;
  }

  if (toolName === 'bitrix_update_contact') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(normalizedArgs.fields, 'Parameter "fields" must be an object');

    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }

    return {
      method: 'crm.contact.update',
      payload: { id, fields },
    } as const;
  }

  throw new BadRequestError(`Unknown tool: ${toolName}`);
};
