import { ToolDefinition } from '../types.js';
import { BadRequestError, ensurePositiveNumber, ensureObject, ensureString, ensureNumber, ensureBoolean } from '../validation.js';

export const miscTools: ToolDefinition[] = [
  {
    name: 'bitrix_timeline_comment_add',
    description: 'Добавить комментарий в timeline сущности CRM.',
    parameters: {
      entityType: { type: 'string', description: 'Тип сущности (deal, lead, contact, company)' },
      entityId: { type: 'number', description: 'ID сущности' },
      comment: { type: 'string', description: 'Текст комментария' },
    },
  },
  {
    name: 'bitrix_batch',
    description: 'Выполнить несколько API-запросов в одном HTTP-вызове. Максимум 50 команд.',
    parameters: {
      cmd: {
        type: 'object',
        description: 'Объект команд: { "key1": "crm.deal.get?id=1", "key2": "crm.contact.get?id=2" }',
      },
      halt: { type: 'boolean', description: 'Остановить выполнение при первой ошибке', optional: true },
    },
  },
  {
    name: 'bitrix_telephony_call_list',
    description: 'Получить список звонков (статистика телефонии).',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (CALL_TYPE, CALL_START_DATE и др.)', optional: true },
      sort: { type: 'string', description: 'Поле сортировки', optional: true },
      order: { type: 'string', description: 'Направление сортировки (ASC/DESC)', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_im_message_add',
    description: 'Отправить сообщение в чат Bitrix24.',
    parameters: {
      dialogId: { type: 'string', description: 'ID диалога (chatXX или userID)' },
      message: { type: 'string', description: 'Текст сообщения' },
    },
  },
  {
    name: 'bitrix_crm_status_list',
    description: 'Получить справочники CRM (статусы, типы и др.).',
    parameters: {
      entityId: { type: 'string', description: 'ID справочника (STATUS, SOURCE, DEAL_STAGE и др.)', optional: true },
    },
  },
  {
    name: 'bitrix_webhook_status',
    description: 'Проверить статус webhook (информация о приложении).',
    parameters: {},
  },
];

export const buildMiscRequest = (toolName: string, args: Record<string, unknown>) => {
  switch (toolName) {
    case 'bitrix_timeline_comment_add': {
      const entityType = ensureString(args.entityType, 'entityType must be a non-empty string');
      const entityId = ensurePositiveNumber(args.entityId, 'entityId must be a positive number');
      const comment = ensureString(args.comment, 'comment must be a non-empty string');
      if (!entityType || !comment) {
        throw new BadRequestError('entityType, entityId and comment are required');
      }
      // Validate entity type against allowed values
      const validEntityTypes = ['lead', 'deal', 'contact', 'company'];
      const normalizedEntityType = entityType.toLowerCase();
      if (!validEntityTypes.includes(normalizedEntityType)) {
        throw new BadRequestError('entityType must be one of: lead, deal, contact, company');
      }
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
    case 'bitrix_batch': {
      const cmd = ensureObject<Record<string, string>>(args.cmd, 'cmd must be an object');
      if (!cmd || Object.keys(cmd).length === 0) {
        throw new BadRequestError('cmd is required and must contain at least one command');
      }
      const halt = ensureBoolean(args.halt, 'halt must be a boolean') ?? false;
      return { method: 'batch', payload: { cmd, halt: halt ? 1 : 0 } };
    }
    case 'bitrix_telephony_call_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const sort = ensureString(args.sort, 'sort must be a non-empty string');
      const order = ensureString(args.order, 'order must be a non-empty string');
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      const payload: Record<string, unknown> = { FILTER: filter, START: start };
      if (sort) {
        payload.SORT = sort;
      }
      if (order) {
        payload.ORDER = order;
      }
      return { method: 'voximplant.statistic.get', payload };
    }
    case 'bitrix_im_message_add': {
      const dialogId = ensureString(args.dialogId, 'dialogId must be a non-empty string');
      const message = ensureString(args.message, 'message must be a non-empty string');
      if (!dialogId || !message) {
        throw new BadRequestError('dialogId and message are required');
      }
      return { method: 'im.message.add', payload: { DIALOG_ID: dialogId, MESSAGE: message } };
    }
    case 'bitrix_crm_status_list': {
      const entityId = ensureString(args.entityId, 'entityId must be a non-empty string');
      const payload: Record<string, unknown> = {};
      if (entityId) {
        payload.filter = { ENTITY_ID: entityId };
      }
      return { method: 'crm.status.list', payload };
    }
    case 'bitrix_webhook_status': {
      return { method: 'app.info', payload: {} };
    }
    default:
      return null;
  }
};
