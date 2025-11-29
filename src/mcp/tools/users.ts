import { ToolDefinition } from '../types.js';
import { ensurePositiveNumber, ensureObject, ensureNumber, ensureString } from '../validation.js';

export const userTools: ToolDefinition[] = [
  {
    name: 'bitrix_user_list',
    description: 'Получить список пользователей.',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (ACTIVE, UF_DEPARTMENT и др.)', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_user_get',
    description: 'Получить пользователя по ID.',
    parameters: {
      id: { type: 'number', description: 'ID пользователя' },
    },
  },
  {
    name: 'bitrix_user_search',
    description: 'Поиск пользователей по строке.',
    parameters: {
      searchString: { type: 'string', description: 'Строка поиска (имя, email и др.)', optional: true },
      filter: { type: 'object', description: 'Фильтр', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_user_current',
    description: 'Получить текущего авторизованного пользователя.',
    parameters: {},
  },
];

export const buildUserRequest = (toolName: string, args: Record<string, unknown>) => {
  switch (toolName) {
    case 'bitrix_user_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'user.get', payload: { filter, start } };
    }
    case 'bitrix_user_get': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'user.get', payload: { ID: id } };
    }
    case 'bitrix_user_search': {
      const searchString = ensureString(args.searchString, 'searchString must be a non-empty string');
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      const payload: Record<string, unknown> = { filter, start };
      if (searchString) {
        payload.FIND = searchString;
      }
      return { method: 'user.search', payload };
    }
    case 'bitrix_user_current': {
      return { method: 'user.current', payload: {} };
    }
    default:
      return null;
  }
};
