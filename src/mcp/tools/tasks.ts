/**
 * Task-related tools for Bitrix24 MCP
 */

import { ToolDefinition, BitrixRequest } from './types.js';
import {
  BadRequestError,
  ensurePositiveNumber,
  ensureString,
  ensureObject,
  getOptionalPositiveNumber,
} from './helpers.js';

export const taskToolDefinitions: ToolDefinition[] = [
  {
    name: 'bitrix_create_task',
    description: 'Создать новую задачу в Bitrix24.',
    parameters: {
      title: { type: 'string', description: 'Название задачи.' },
      responsibleId: { type: 'number', description: 'ID ответственного пользователя.' },
      description: { type: 'string', description: 'Описание задачи.', optional: true },
      deadline: { type: 'string', description: 'Крайний срок в формате ISO 8601.', optional: true },
      priority: {
        type: 'number',
        description: 'Приоритет задачи (0 - низкий, 1 - средний, 2 - высокий).',
        optional: true,
      },
      groupId: { type: 'number', description: 'ID группы/проекта.', optional: true },
      fields: {
        type: 'object',
        description: 'Дополнительные поля задачи.',
        optional: true,
      },
    },
  },
  {
    name: 'bitrix_get_task',
    description: 'Получить задачу Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID задачи.' },
    },
  },
  {
    name: 'bitrix_update_task',
    description: 'Обновить существующую задачу в Bitrix24.',
    parameters: {
      id: { type: 'number', description: 'ID задачи.' },
      fields: {
        type: 'object',
        description: 'Поля задачи для обновления (TITLE, DESCRIPTION, DEADLINE, PRIORITY и др.).',
        additionalProperties: true,
      },
    },
  },
  {
    name: 'bitrix_list_tasks',
    description: 'Получить список задач с фильтрацией.',
    parameters: {
      filter: {
        type: 'object',
        description: 'Фильтр поиска (RESPONSIBLE_ID, STATUS, PRIORITY, CREATED_BY, GROUP_ID и др.).',
        optional: true,
      },
      order: {
        type: 'object',
        description: 'Сортировка (например, {DEADLINE: "ASC"}).',
        optional: true,
      },
      start: { type: 'number', description: 'Начальная позиция для пагинации (по умолчанию 0).', optional: true },
      limit: { type: 'number', description: 'Лимит результатов (по умолчанию 50).', optional: true },
    },
  },
  {
    name: 'bitrix_get_task_comments',
    description: 'Получить комментарии к задаче.',
    parameters: {
      taskId: { type: 'number', description: 'ID задачи.' },
    },
  },
  {
    name: 'bitrix_add_task_comment',
    description: 'Добавить комментарий к задаче.',
    parameters: {
      taskId: { type: 'number', description: 'ID задачи.' },
      comment: { type: 'string', description: 'Текст комментария.' },
    },
  },
  {
    name: 'bitrix_get_task_checklist',
    description: 'Получить чеклист задачи.',
    parameters: {
      taskId: { type: 'number', description: 'ID задачи.' },
    },
  },
];

export const buildTaskRequest = (toolName: string, args: Record<string, unknown>): BitrixRequest | null => {
  if (toolName === 'bitrix_create_task') {
    const title = ensureString(args.title, 'Parameter "title" must be a non-empty string');
    const responsibleId = ensurePositiveNumber(args.responsibleId, 'Parameter "responsibleId" must be a positive number');
    const description = ensureString(args.description, 'Parameter "description" must be a non-empty string when provided');
    const deadline = ensureString(args.deadline, 'Parameter "deadline" must be a non-empty string when provided');
    const priority = typeof args.priority === 'number' ? args.priority : undefined;
    const groupId = typeof args.groupId === 'number' ? args.groupId : undefined;
    const additionalFields = ensureObject<Record<string, unknown>>(
      args.fields,
      'Parameter "fields" must be an object when provided'
    );

    const fields: Record<string, unknown> = {
      TITLE: title,
      RESPONSIBLE_ID: responsibleId,
      ...(additionalFields || {}),
    };

    if (description) {
      fields['DESCRIPTION'] = description;
    }
    if (deadline) {
      fields['DEADLINE'] = deadline;
    }
    if (priority !== undefined) {
      fields['PRIORITY'] = priority;
    }
    if (groupId !== undefined) {
      fields['GROUP_ID'] = groupId;
    }

    return { method: 'tasks.task.add', payload: { fields } };
  }

  if (toolName === 'bitrix_get_task') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    return { method: 'tasks.task.get', payload: { taskId: id } };
  }

  if (toolName === 'bitrix_update_task') {
    const id = ensurePositiveNumber(args.id, 'Parameter "id" must be a positive number');
    const fields = ensureObject<Record<string, unknown>>(args.fields, 'Parameter "fields" must be an object');
    if (!fields || Object.keys(fields).length === 0) {
      throw new BadRequestError('Parameter "fields" must include at least one field');
    }
    return { method: 'tasks.task.update', payload: { taskId: id, fields } };
  }

  if (toolName === 'bitrix_list_tasks') {
    const filter = ensureObject<Record<string, unknown>>(args.filter, 'Parameter "filter" must be an object when provided');
    const order = ensureObject<Record<string, unknown>>(args.order, 'Parameter "order" must be an object when provided');
    const start = getOptionalPositiveNumber(args.start, 0) || 0;
    const limit = getOptionalPositiveNumber(args.limit, 50);

    const payload: Record<string, unknown> = { start, limit };
    if (filter) {
      payload.filter = filter;
    }
    if (order) {
      payload.order = order;
    }

    return { method: 'tasks.task.list', payload };
  }

  if (toolName === 'bitrix_get_task_comments') {
    const taskId = ensurePositiveNumber(args.taskId, 'Parameter "taskId" must be a positive number');
    return { method: 'task.commentitem.getlist', payload: { TASKID: taskId } };
  }

  if (toolName === 'bitrix_add_task_comment') {
    const taskId = ensurePositiveNumber(args.taskId, 'Parameter "taskId" must be a positive number');
    const comment = ensureString(args.comment, 'Parameter "comment" must be a non-empty string');
    return {
      method: 'task.commentitem.add',
      payload: { TASKID: taskId, FIELDS: { POST_MESSAGE: comment } },
    };
  }

  if (toolName === 'bitrix_get_task_checklist') {
    const taskId = ensurePositiveNumber(args.taskId, 'Parameter "taskId" must be a positive number');
    return { method: 'task.checklistitem.getlist', payload: { TASKID: taskId } };
  }

  return null;
};
