/**
 * Utility and diagnostic tools for Bitrix24 MCP
 */

import { ToolDefinition, BitrixRequest } from './types.js';
import {
  BadRequestError,
  ensurePositiveNumber,
  ensureString,
  validateEntityType,
  getOptionalPositiveNumber,
} from './helpers.js';

export const utilToolDefinitions: ToolDefinition[] = [
  // Timeline tools
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
    name: 'bitrix_get_timeline',
    description: 'Получить таймлайн сущности (комментарии и события).',
    parameters: {
      entityType: { type: 'string', description: 'Тип сущности: deal, contact, lead, company.' },
      entityId: { type: 'number', description: 'ID сущности.' },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_add_timeline_comment',
    description: 'Добавить комментарий в таймлайн сущности (расширенная версия).',
    parameters: {
      entityType: { type: 'string', description: 'Тип сущности: deal, contact, lead, company.' },
      entityId: { type: 'number', description: 'ID сущности.' },
      comment: { type: 'string', description: 'Текст комментария.' },
      authorId: { type: 'number', description: 'ID автора комментария.', optional: true },
    },
  },

  // Status and fields tools
  {
    name: 'bitrix_get_status_list',
    description: 'Получить список статусов CRM (лиды, сделки, источники и др.).',
    parameters: {
      entityId: {
        type: 'string',
        description:
          'ID типа статуса: STATUS (лиды), DEAL_STAGE (сделки), SOURCE, CONTACT_SOURCE, COMPANY_TYPE, INDUSTRY.',
        optional: true,
      },
    },
  },

  // Telephony tools
  {
    name: 'bitrix_get_call_statistics',
    description: 'Получить статистику звонков за период.',
    parameters: {
      dateFrom: { type: 'string', description: 'Начальная дата в формате ISO 8601 (YYYY-MM-DD).' },
      dateTo: { type: 'string', description: 'Конечная дата в формате ISO 8601 (YYYY-MM-DD).' },
    },
  },

  // File tools
  {
    name: 'bitrix_get_file',
    description: 'Получить информацию о файле по ID.',
    parameters: {
      id: { type: 'number', description: 'ID файла.' },
    },
  },
  {
    name: 'bitrix_upload_file',
    description: 'Загрузить файл на диск Bitrix24.',
    parameters: {
      folderId: { type: 'number', description: 'ID папки для загрузки.' },
      fileName: { type: 'string', description: 'Имя файла.' },
      fileContent: { type: 'string', description: 'Содержимое файла в base64.' },
    },
  },

  // Diagnostic tools
  {
    name: 'bitrix_validate_webhook',
    description: 'Проверить подключение к Bitrix24 webhook.',
    parameters: {},
  },
  {
    name: 'bitrix_diagnose_permissions',
    description: 'Диагностика прав доступа webhook (проверка доступных методов).',
    parameters: {},
  },
  {
    name: 'bitrix_check_crm_settings',
    description: 'Проверить настройки CRM (режим работы, воронки, статусы).',
    parameters: {},
  },
  {
    name: 'bitrix_get_crm_summary',
    description: 'Получить сводную информацию о CRM (количество сделок, лидов, контактов и компаний).',
    parameters: {},
  },
];

export const buildUtilRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  // Timeline tools
  if (toolName === 'bitrix_add_comment') {
    const entityType = ensureString(args.entityType, 'Parameter "entityType" must be a non-empty string');
    const entityId = ensurePositiveNumber(args.entityId, 'Parameter "entityId" must be a positive number');
    const comment = ensureString(args.comment, 'Parameter "comment" must be a non-empty string');

    const normalizedEntityType = validateEntityType(entityType);

    return {
      method: 'crm.timeline.comment.add',
      payload: {
        fields: {
          ENTITY_ID: entityId,
          ENTITY_TYPE: normalizedEntityType,
          COMMENT: comment,
        },
      },
    };
  }

  if (toolName === 'bitrix_get_timeline') {
    const entityType = ensureString(args.entityType, 'Parameter "entityType" must be a non-empty string');
    const entityId = ensurePositiveNumber(args.entityId, 'Parameter "entityId" must be a positive number');
    const limit = getOptionalPositiveNumber(args.limit, 50);

    const normalizedEntityType = validateEntityType(entityType);

    return {
      method: 'crm.timeline.comment.list',
      payload: {
        filter: {
          ENTITY_ID: entityId,
          ENTITY_TYPE: normalizedEntityType,
        },
        start: 0,
        limit,
      },
    };
  }

  if (toolName === 'bitrix_add_timeline_comment') {
    const entityType = ensureString(args.entityType, 'Parameter "entityType" must be a non-empty string');
    const entityId = ensurePositiveNumber(args.entityId, 'Parameter "entityId" must be a positive number');
    const comment = ensureString(args.comment, 'Parameter "comment" must be a non-empty string');
    const authorId = typeof args.authorId === 'number' ? args.authorId : undefined;

    const normalizedEntityType = validateEntityType(entityType);

    const fields: Record<string, unknown> = {
      ENTITY_ID: entityId,
      ENTITY_TYPE: normalizedEntityType,
      COMMENT: comment,
    };

    if (authorId !== undefined) {
      fields['AUTHOR_ID'] = authorId;
    }

    return {
      method: 'crm.timeline.comment.add',
      payload: { fields },
    };
  }

  // Status and fields tools
  if (toolName === 'bitrix_get_status_list') {
    const entityId = ensureString(args.entityId, 'Parameter "entityId" must be a non-empty string when provided');
    const filter: Record<string, unknown> = {};

    if (entityId) {
      filter['ENTITY_ID'] = entityId;
    }

    return { method: 'crm.status.list', payload: { filter } };
  }

  // Telephony tools
  if (toolName === 'bitrix_get_call_statistics') {
    const dateFrom = ensureString(args.dateFrom, 'Parameter "dateFrom" must be a non-empty string');
    const dateTo = ensureString(args.dateTo, 'Parameter "dateTo" must be a non-empty string');

    if (!dateFrom || !dateTo) {
      throw new BadRequestError('Both "dateFrom" and "dateTo" are required');
    }

    return {
      method: 'voximplant.statistic.get',
      payload: {
        FILTER: {
          '>=CALL_START_DATE': dateFrom,
          '<=CALL_START_DATE': dateTo,
        },
      },
    };
  }

  // File tools
  if (toolName === 'bitrix_get_file') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'disk.file.get', payload: { id } };
  }

  if (toolName === 'bitrix_upload_file') {
    const folderId = ensurePositiveNumber(args.folderId, 'Parameter "folderId" must be a positive number');
    const fileName = ensureString(args.fileName, 'Parameter "fileName" must be a non-empty string');
    const fileContent = ensureString(args.fileContent, 'Parameter "fileContent" must be a non-empty string');

    return {
      method: 'disk.folder.uploadfile',
      payload: {
        id: folderId,
        data: { NAME: fileName },
        fileContent: ['file.txt', fileContent],
      },
    };
  }

  // Diagnostic tools
  if (toolName === 'bitrix_validate_webhook') {
    // Simple API call to verify connection
    return { method: 'user.current', payload: {} };
  }

  if (toolName === 'bitrix_diagnose_permissions') {
    // Get available scopes and methods
    return { method: 'scope', payload: {} };
  }

  if (toolName === 'bitrix_check_crm_settings') {
    // Get CRM settings including lead mode
    return { method: 'crm.settings.mode.get', payload: {} };
  }

  if (toolName === 'bitrix_get_crm_summary') {
    // Use batch to get counts from multiple entities
    // For now, return deal list with minimal data as a summary
    return {
      method: 'batch',
      payload: {
        halt: 0,
        cmd: {
          deals: 'crm.deal.list?start=0&limit=1',
          leads: 'crm.lead.list?start=0&limit=1',
          contacts: 'crm.contact.list?start=0&limit=1',
          companies: 'crm.company.list?start=0&limit=1',
        },
      },
    };
  }

  return null;
};
