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
    name: 'bitrix_add_comment',
    description: 'Добавить комментарий к сделке, контакту, компании или лиду в timeline.',
    parameters: {
      entityType: { type: 'string', description: 'Тип сущности: deal, contact, lead, company.' },
      entityId: { type: 'number', description: 'ID сущности.' },
      comment: { type: 'string', description: 'Текст комментария.' },
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
    name: 'bitrix_create_company',
    description: 'Создать новую компанию в Bitrix24.',
    parameters: {
      title: { type: 'string', description: 'Название компании.' },
      fields: {
        type: 'object',
        description: 'Дополнительные поля (PHONE, EMAIL, ADDRESS и др.).',
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_get_company',
    description: 'Получить компанию Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID компании.' },
    },
  },
  {
    name: 'bitrix_create_lead',
    description: 'Создать новый лид в Bitrix24.',
    parameters: {
      title: { type: 'string', description: 'Название лида.' },
      fields: {
        type: 'object',
        description: 'Дополнительные поля (PHONE, EMAIL, SOURCE_ID и др.).',
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_get_lead',
    description: 'Получить лид Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID лида.' },
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

  if (toolName === 'bitrix_search_deals') {
    const filter = ensureObject(normalizedArgs.filter, 'Parameter "filter" must be an object when provided') || {};
    const limit = typeof normalizedArgs.limit === 'number' ? normalizedArgs.limit : 50;

    return {
      method: 'crm.deal.list',
      payload: { filter, start: 0, limit },
    };
  }

  if (toolName === 'bitrix_add_comment') {
    const entityType = ensureString(normalizedArgs.entityType, 'Parameter "entityType" must be a non-empty string');
    const entityId = ensurePositiveNumber(normalizedArgs.entityId, 'Parameter "entityId" must be a positive number');
    const comment = ensureString(normalizedArgs.comment, 'Parameter "comment" must be a non-empty string');

    const entityTypeMap = {
      deal: 'deal',
      contact: 'contact',
      company: 'company',
      lead: 'lead',
    };

    if (!entityType || !entityTypeMap[entityType.toLowerCase()]) {
      throw new BadRequestError('Parameter "entityType" must be one of: deal, contact, company, lead');
    }

    return {
      method: 'crm.timeline.comment.add',
      payload: {
        fields: {
          ENTITY_ID: entityId,
          ENTITY_TYPE: entityType.toUpperCase(),
          COMMENT: comment,
        },
      },
    };
  }

  if (toolName === 'bitrix_get_contact') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.contact.get', payload: { id } };
  }

  if (toolName === 'bitrix_create_company') {
    const title = ensureString(normalizedArgs.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject(normalizedArgs.fields, 'Parameter "fields" must be an object when provided');
    return {
      method: 'crm.company.add',
      payload: { fields: { TITLE: title, ...(fields || {}) } },
    };
  }

  if (toolName === 'bitrix_get_company') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.company.get', payload: { id } };
  }

  if (toolName === 'bitrix_create_lead') {
    const title = ensureString(normalizedArgs.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject(normalizedArgs.fields, 'Parameter "fields" must be an object when provided');
    return {
      method: 'crm.lead.add',
      payload: { fields: { TITLE: title, ...(fields || {}) } },
    };
  }

  if (toolName === 'bitrix_get_lead') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    return { method: 'crm.lead.get', payload: { id } };
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
