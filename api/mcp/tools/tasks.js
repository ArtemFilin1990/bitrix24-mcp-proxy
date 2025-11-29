import { BadRequestError } from '../errors.js';

// Validation helpers
const ensureObject = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) throw new BadRequestError(message);
  return value;
};

const ensurePositiveNumber = (value, message) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) throw new BadRequestError(message);
  return value;
};

const ensureNumber = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'number' || Number.isNaN(value)) throw new BadRequestError(message);
  return value;
};

const ensureArray = (value, message) => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new BadRequestError(message);
  return value;
};

export const taskTools = [
  {
    name: 'bitrix_task_list',
    description: 'Получить список задач.',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (RESPONSIBLE_ID, STATUS и др.)', optional: true },
      select: { type: 'array', description: 'Список полей для выборки', optional: true },
      order: { type: 'object', description: 'Сортировка', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_task_get',
    description: 'Получить задачу по идентификатору.',
    parameters: {
      taskId: { type: 'number', description: 'ID задачи' },
    },
  },
  {
    name: 'bitrix_task_add',
    description: 'Создать новую задачу.',
    parameters: {
      fields: { type: 'object', description: 'Поля задачи (обязательно TITLE, RESPONSIBLE_ID)' },
    },
  },
  {
    name: 'bitrix_task_update',
    description: 'Обновить существующую задачу.',
    parameters: {
      taskId: { type: 'number', description: 'ID задачи' },
      fields: { type: 'object', description: 'Поля для обновления.' },
    },
  },
  {
    name: 'bitrix_task_close',
    description: 'Завершить задачу.',
    parameters: {
      taskId: { type: 'number', description: 'ID задачи' },
    },
  },
];

export const buildTaskRequest = (toolName, args) => {
  switch (toolName) {
    case 'bitrix_task_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const select = ensureArray(args.select, 'select must be an array') || ['*'];
      const order = ensureObject(args.order, 'order must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'tasks.task.list', payload: { filter, select, order, start } };
    }
    case 'bitrix_task_get': {
      const taskId = ensurePositiveNumber(args.taskId, 'taskId must be a positive number');
      return { method: 'tasks.task.get', payload: { taskId } };
    }
    case 'bitrix_task_add': {
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || !fields.TITLE || !fields.RESPONSIBLE_ID) {
        throw new BadRequestError('fields.TITLE and fields.RESPONSIBLE_ID are required');
      }
      return { method: 'tasks.task.add', payload: { fields } };
    }
    case 'bitrix_task_update': {
      const taskId = ensurePositiveNumber(args.taskId, 'taskId must be a positive number');
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('fields must include at least one field');
      }
      return { method: 'tasks.task.update', payload: { taskId, fields } };
    }
    case 'bitrix_task_close': {
      const taskId = ensurePositiveNumber(args.taskId, 'taskId must be a positive number');
      return { method: 'tasks.task.complete', payload: { taskId } };
    }
    default:
      return null;
  }
};
