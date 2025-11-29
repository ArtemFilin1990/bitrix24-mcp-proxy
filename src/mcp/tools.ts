import { McpTool } from './types.js';

export class BadRequestError extends Error {
  statusCode = 400;
}

export class ConfigurationError extends Error {
  statusCode = 500;
}

export const tools: McpTool[] = [
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
    description: 'Обновить поля существующей сделки Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'Числовой ID сделки Bitrix24.' },
      fields: {
        type: 'object',
        description: 'Набор полей сделки для обновления (например, STAGE_ID, COMMENTS, OPPORTUNITY).',
        additionalProperties: true,
      },
    },
  },
  {
    name: 'bitrix_find_contact',
    description: 'Найти контакт по телефону или email (хотя бы один параметр обязателен).',
    parameters: {
      phone: { type: 'string', description: 'Телефон в международном формате. Необязателен, но нужен телефон или email.' },
      email: { type: 'string', description: 'Email контакта. Необязателен, но нужен телефон или email.' },
    },
  },
  {
    name: 'bitrix_add_deal_comment',
    description: 'Добавить комментарий в ленту сделки.',
    parameters: {
      id: { type: 'number', description: 'Числовой ID сделки Bitrix24.' },
      comment: { type: 'string', description: 'Текст комментария.' },
    },
  },
  {
    name: 'bitrix_trigger_automation',
    description: 'Запустить автоматизацию (триггер) для сущности Bitrix24.',
    parameters: {
      code: { type: 'string', description: 'Код триггера автоматизации, настроенный в Bitrix24.' },
      entityType: {
        type: 'string',
        description: 'Тип сущности (DEAL или LEAD). По умолчанию DEAL.',
        enum: ['DEAL', 'LEAD'],
      },
      entityId: { type: 'number', description: 'Числовой ID сущности, для которой запускаем автоматизацию.' },
    },
  },
];

const ensureObject = <T extends object>(value: unknown, message: string): T | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestError(message);
  }

  return value as T;
};

const ensureNonEmptyString = (value: unknown, message: string): string => {
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

const ensureNonEmptyObject = <T extends object>(value: unknown, message: string): T => {
  const objectValue = ensureObject<T>(value, message);

  if (!objectValue || Object.keys(objectValue).length === 0) {
    throw new BadRequestError(message);
  }

  return objectValue;
};

const normalizeCallPayload = (
  toolOrPayload: string | { tool?: string; args?: Record<string, unknown> },
  args?: Record<string, unknown>,
): { tool: string; args: Record<string, unknown> } => {
  if (typeof toolOrPayload === 'string') {
    return { tool: toolOrPayload, args: typeof args === 'object' && !Array.isArray(args) ? args : {} };
  }

  if (toolOrPayload && typeof toolOrPayload === 'object' && !Array.isArray(toolOrPayload)) {
    const { tool, args: payloadArgs } = toolOrPayload;
    return {
      tool: tool ?? '',
      args: (typeof payloadArgs === 'object' && payloadArgs && !Array.isArray(payloadArgs)) ? payloadArgs : {},
    };
  }

  return { tool: '', args: {} };
};

const normalizeWebhookBase = (webhookUrl: string): string => webhookUrl.replace(/\/$/, '');

export const buildBitrixRequest = (
  toolOrPayload: string | { tool?: string; args?: Record<string, unknown> },
  args: Record<string, unknown> = {},
) => {
  const { tool, args: normalizedArgs } = normalizeCallPayload(toolOrPayload, args);

  if (!tool) {
    throw new BadRequestError('Tool name is required');
  }

  if (tool === 'bitrix_get_deal') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');

    return {
      method: 'crm.deal.get',
      payload: { id },
    } as const;
  }

  if (tool === 'bitrix_create_deal') {
    const title = ensureNonEmptyString(normalizedArgs.title, 'Parameter "title" must be a non-empty string');
    const fields = ensureObject<Record<string, unknown>>(normalizedArgs.fields, 'Parameter "fields" must be an object when provided');
    const payloadFields = { TITLE: title, ...(fields || {}) };

    return {
      method: 'crm.deal.add',
      payload: { fields: payloadFields },
    } as const;
  }

  if (tool === 'bitrix_update_deal') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    const fields = ensureNonEmptyObject<Record<string, unknown>>(
      normalizedArgs.fields,
      'Parameter "fields" must be a non-empty object',
    );

    return {
      method: 'crm.deal.update',
      payload: { id, fields },
    } as const;
  }

  if (tool === 'bitrix_find_contact') {
    const phone = typeof normalizedArgs.phone === 'string' ? normalizedArgs.phone.trim() : '';
    const email = typeof normalizedArgs.email === 'string' ? normalizedArgs.email.trim() : '';

    if (!phone && !email) {
      throw new BadRequestError('At least one of "phone" or "email" must be provided');
    }

    const filter: Record<string, unknown> = {};
    if (phone) filter.PHONE = phone;
    if (email) filter.EMAIL = email;

    return {
      method: 'crm.contact.list',
      payload: {
        filter,
        select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL', 'ASSIGNED_BY_ID'],
      },
    } as const;
  }

  if (tool === 'bitrix_add_deal_comment') {
    const id = ensurePositiveNumber(normalizedArgs.id, 'Parameter "id" must be a positive number');
    const comment = ensureNonEmptyString(normalizedArgs.comment, 'Parameter "comment" must be a non-empty string');

    return {
      method: 'crm.timeline.comment.add',
      payload: { fields: { ENTITY_TYPE: 'deal', ENTITY_ID: id, COMMENT: comment } },
    } as const;
  }

  if (tool === 'bitrix_trigger_automation') {
    const code = ensureNonEmptyString(normalizedArgs.code, 'Parameter "code" must be a non-empty string');
    const entityId = ensurePositiveNumber(normalizedArgs.entityId, 'Parameter "entityId" must be a positive number');
    const entityTypeRaw = normalizedArgs.entityType;
    const allowedTypes = ['DEAL', 'LEAD'];
    const entityType = typeof entityTypeRaw === 'string' && entityTypeRaw.trim().length > 0
      ? entityTypeRaw.trim().toUpperCase()
      : 'DEAL';

    if (!allowedTypes.includes(entityType)) {
      throw new BadRequestError('Parameter "entityType" must be one of DEAL or LEAD');
    }

    return {
      method: 'crm.automation.trigger',
      payload: { code, target: `${entityType}_${entityId}` },
    } as const;
  }

  throw new BadRequestError(`Unknown tool: ${tool}`);
};

export const resolveWebhookBase = (): string => {
  const webhook = process.env.BITRIX_WEBHOOK_URL;

  if (!webhook) {
    throw new ConfigurationError('Environment variable BITRIX_WEBHOOK_URL is not set');
  }

  return normalizeWebhookBase(webhook);
};
