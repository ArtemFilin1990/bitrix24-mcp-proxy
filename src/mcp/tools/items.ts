import { ToolDefinition } from '../types.js';
import { BadRequestError, ensurePositiveNumber, ensureObject, ensureNumber, ensureArray } from '../validation.js';

export const itemTools: ToolDefinition[] = [
  {
    name: 'bitrix_item_list',
    description: 'Получить элементы смарт-процесса.',
    parameters: {
      entityTypeId: { type: 'number', description: 'ID типа сущности (смарт-процесса)' },
      filter: { type: 'object', description: 'Фильтр', optional: true },
      select: { type: 'array', description: 'Список полей для выборки', optional: true },
      order: { type: 'object', description: 'Сортировка', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_item_get',
    description: 'Получить элемент смарт-процесса по ID.',
    parameters: {
      entityTypeId: { type: 'number', description: 'ID типа сущности (смарт-процесса)' },
      id: { type: 'number', description: 'ID элемента' },
    },
  },
  {
    name: 'bitrix_item_add',
    description: 'Создать элемент смарт-процесса.',
    parameters: {
      entityTypeId: { type: 'number', description: 'ID типа сущности (смарт-процесса)' },
      fields: {
        type: 'object',
        description: 'Поля элемента',
      },
    },
  },
  {
    name: 'bitrix_item_update',
    description: 'Обновить элемент смарт-процесса.',
    parameters: {
      entityTypeId: { type: 'number', description: 'ID типа сущности (смарт-процесса)' },
      id: { type: 'number', description: 'ID элемента' },
      fields: {
        type: 'object',
        description: 'Поля для обновления.',
      },
    },
  },
  {
    name: 'bitrix_item_delete',
    description: 'Удалить элемент смарт-процесса.',
    parameters: {
      entityTypeId: { type: 'number', description: 'ID типа сущности (смарт-процесса)' },
      id: { type: 'number', description: 'ID элемента' },
    },
  },
  {
    name: 'bitrix_item_fields',
    description: 'Получить поля смарт-процесса.',
    parameters: {
      entityTypeId: { type: 'number', description: 'ID типа сущности (смарт-процесса)' },
    },
  },
  {
    name: 'bitrix_item_type_list',
    description: 'Получить список смарт-процессов.',
    parameters: {},
  },
  {
    name: 'bitrix_item_type_get',
    description: 'Получить смарт-процесс по ID.',
    parameters: {
      id: { type: 'number', description: 'ID смарт-процесса' },
    },
  },
];

export const buildItemRequest = (toolName: string, args: Record<string, unknown>) => {
  switch (toolName) {
    case 'bitrix_item_list': {
      const entityTypeId = ensurePositiveNumber(args.entityTypeId, 'entityTypeId must be a positive number');
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const select = ensureArray(args.select, 'select must be an array') || ['*'];
      const order = ensureObject(args.order, 'order must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'crm.item.list', payload: { entityTypeId, filter, select, order, start } };
    }
    case 'bitrix_item_get': {
      const entityTypeId = ensurePositiveNumber(args.entityTypeId, 'entityTypeId must be a positive number');
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.item.get', payload: { entityTypeId, id } };
    }
    case 'bitrix_item_add': {
      const entityTypeId = ensurePositiveNumber(args.entityTypeId, 'entityTypeId must be a positive number');
      const fields = ensureObject<Record<string, unknown>>(args.fields, 'fields must be an object');
      if (!fields) {
        throw new BadRequestError('fields is required');
      }
      return { method: 'crm.item.add', payload: { entityTypeId, fields } };
    }
    case 'bitrix_item_update': {
      const entityTypeId = ensurePositiveNumber(args.entityTypeId, 'entityTypeId must be a positive number');
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('fields must include at least one field');
      }
      return { method: 'crm.item.update', payload: { entityTypeId, id, fields } };
    }
    case 'bitrix_item_delete': {
      const entityTypeId = ensurePositiveNumber(args.entityTypeId, 'entityTypeId must be a positive number');
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.item.delete', payload: { entityTypeId, id } };
    }
    case 'bitrix_item_fields': {
      const entityTypeId = ensurePositiveNumber(args.entityTypeId, 'entityTypeId must be a positive number');
      return { method: 'crm.item.fields', payload: { entityTypeId } };
    }
    case 'bitrix_item_type_list': {
      return { method: 'crm.type.list', payload: {} };
    }
    case 'bitrix_item_type_get': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.type.get', payload: { id } };
    }
    default:
      return null;
  }
};
