import { BadRequestError, ConfigurationError } from './errors.js';

export const toolDefinitions = [
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

export const tools = toolDefinitions.map((tool) => tool.name);

const normalizeWebhookBase = (webhookUrl) => webhookUrl.replace(/\/$/, '');

const ensureObject = (value, message) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestError(message);
  }

  return value;
};

const ensureString = (value, message) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(message);
  }

  return value.trim();
};

const ensurePositiveNumber = (value, message) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new BadRequestError(message);
  }

  return value;
};

export const buildBitrixRequest = (toolName, args = {}) => {
  if (!toolName) {
    throw new BadRequestError('Tool name is required');
  }

  const normalizedArgs = typeof args === 'object' && !Array.isArray(args) ? args : {};

  if (toolName === 'bitrix_get_deal') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');

    return {
      method: 'crm.deal.get',
      payload: { id },
    };
  }

  if (toolName === 'bitrix_create_deal') {
    const title = ensureString(normalizedArgs.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject(normalizedArgs.fields, 'Parameter "fields" must be an object when provided');
    const payloadFields = { TITLE: title, ...(fields || {}) };

    return {
      method: 'crm.deal.add',
      payload: { fields: payloadFields },
    };
  }

  if (toolName === 'bitrix_update_deal') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject(normalizedArgs.fields, 'Parameter "fields" must be an object');

    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }

    return {
      method: 'crm.deal.update',
      payload: { id, fields },
    };
  }

  if (toolName === 'bitrix_find_contact') {
    const phone = ensureString(normalizedArgs.phone, 'Parameter "phone" must be a non-empty string when provided');
    const email = ensureString(normalizedArgs.email, 'Parameter "email" must be a non-empty string when provided');

    if (!phone && !email) {
      throw new BadRequestError('Either "phone" or "email" must be provided');
    }

    const filter = {};

    if (phone) {
      filter.PHONE = phone;
    }

    if (email) {
      filter.EMAIL = email;
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
    const firstName = ensureString(normalizedArgs.firstName, 'Parameter "firstName" must be a non-empty string');
    const lastName = ensureString(normalizedArgs.lastName, 'Parameter "lastName" must be a non-empty string when provided');
    const phone = ensureString(normalizedArgs.phone, 'Parameter "phone" must be a non-empty string when provided');
    const email = ensureString(normalizedArgs.email, 'Parameter "email" must be a non-empty string when provided');

    const fields = { NAME: firstName };

    if (lastName) {
      fields.LAST_NAME = lastName;
    }

    if (phone) {
      fields.PHONE = [{ VALUE: phone, VALUE_TYPE: 'WORK' }];
    }

    if (email) {
      fields.EMAIL = [{ VALUE: email, VALUE_TYPE: 'WORK' }];
    }

    return {
      method: 'crm.contact.add',
      payload: { fields },
    };
  }

  if (toolName === 'bitrix_update_contact') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject(normalizedArgs.fields, 'Parameter "fields" must be an object');

    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }

    return {
      method: 'crm.contact.update',
      payload: { id, fields },
    };
  }

  throw new BadRequestError(`Unknown tool: ${toolName}`);
};

export const resolveWebhookBase = () => {
  const webhook = process.env.BITRIX_WEBHOOK_URL;

  if (!webhook) {
    throw new ConfigurationError('Environment variable BITRIX_WEBHOOK_URL is not set');
  }

  return normalizeWebhookBase(webhook);
};
