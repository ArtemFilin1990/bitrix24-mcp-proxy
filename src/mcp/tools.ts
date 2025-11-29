import { McpTool } from './types.js';

export class BadRequestError extends Error {
  statusCode = 400;
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

export const buildBitrixRequest = (toolName: string, args: Record<string, unknown> = {}) => {
  if (!toolName) {
    throw new BadRequestError('Tool name is required');
  }

  const normalizedArgs = typeof args === 'object' && !Array.isArray(args) ? args : {};

  if (toolName === 'bitrix_get_deal') {
    const id = normalizedArgs.id as number;

    if (typeof id !== 'number' || Number.isNaN(id) || id <= 0) {
      throw new BadRequestError('Parameter "id" must be a positive number');
    }

    return {
      method: 'crm.deal.get',
      payload: { id },
    } as const;
  }

  if (toolName === 'bitrix_create_deal') {
    const title = normalizedArgs.title as string;

    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Parameter "title" must be a non-empty string');
    }

    const fields = ensureObject<Record<string, unknown>>(normalizedArgs.fields, 'Parameter "fields" must be an object when provided');
    const payloadFields = { TITLE: title.trim(), ...(fields || {}) };

    return {
      method: 'crm.deal.add',
      payload: { fields: payloadFields },
    } as const;
  }

  throw new BadRequestError(`Unknown tool: ${toolName}`);
};
