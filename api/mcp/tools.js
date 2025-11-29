import { BadRequestError, ConfigurationError } from './errors.js';

export const tools = [
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
];

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

export const buildBitrixRequest = (toolName, args = {}) => {
  if (!toolName) {
    throw new BadRequestError('Tool name is required');
  }

  const normalizedArgs = typeof args === 'object' && !Array.isArray(args) ? args : {};

  if (toolName === 'bitrix_get_deal') {
    const id = normalizedArgs.id;

    if (typeof id !== 'number' || Number.isNaN(id) || id <= 0) {
      throw new BadRequestError('Parameter "id" must be a positive number');
    }

    return {
      method: 'crm.deal.get',
      payload: { id },
    };
  }

  if (toolName === 'bitrix_create_deal') {
    const { title, fields } = normalizedArgs;

    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Parameter "title" must be a non-empty string');
    }

    const extraFields = ensureObject(fields, 'Parameter "fields" must be an object when provided');
    const payloadFields = { TITLE: title.trim(), ...(extraFields || {}) };

    return {
      method: 'crm.deal.add',
      payload: { fields: payloadFields },
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
