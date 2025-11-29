import { BadRequestError } from '../errors.js';

// Validation helpers
const ensureObject = (value, message) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestError(message);
  }
  return value;
};

const ensurePositiveNumber = (value, message) => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
    throw new BadRequestError(message);
  }
  return value;
};

const ensureNumber = (value, message) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new BadRequestError(message);
  }
  return value;
};

const ensureArray = (value, message) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new BadRequestError(message);
  }
  return value;
};

// Deal tools
export const dealTools = [
  {
    name: 'bitrix_deal_list',
    description: 'Получить список сделок с возможностью фильтрации, сортировки и выборки полей.',
    parameters: {
      filter: { type: 'object', description: 'Фильтр (STAGE_ID, ASSIGNED_BY_ID, >=OPPORTUNITY и др.)', optional: true },
      select: { type: 'array', description: 'Список полей для выборки', optional: true },
      order: { type: 'object', description: 'Сортировка (например, { DATE_CREATE: "DESC" })', optional: true },
      start: { type: 'number', description: 'Смещение для пагинации', optional: true },
    },
  },
  {
    name: 'bitrix_deal_get',
    description: 'Получить сделку Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID сделки' },
    },
  },
  {
    name: 'bitrix_deal_add',
    description: 'Создать новую сделку Bitrix24 с обязательным заголовком.',
    parameters: {
      fields: { type: 'object', description: 'Поля сделки (обязательно TITLE, опционально OPPORTUNITY, STAGE_ID и др.)' },
    },
  },
  {
    name: 'bitrix_deal_update',
    description: 'Обновить существующую сделку Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID сделки' },
      fields: { type: 'object', description: 'Поля сделки для обновления.' },
    },
  },
  {
    name: 'bitrix_deal_delete',
    description: 'Удалить сделку Bitrix24 по идентификатору.',
    parameters: {
      id: { type: 'number', description: 'ID сделки' },
    },
  },
  {
    name: 'bitrix_deal_fields',
    description: 'Получить описание полей сделки.',
    parameters: {},
  },
  {
    name: 'bitrix_deal_category_list',
    description: 'Получить список воронок (направлений) сделок.',
    parameters: {},
  },
  {
    name: 'bitrix_deal_stage_list',
    description: 'Получить стадии воронки по ID воронки.',
    parameters: {
      categoryId: { type: 'number', description: 'ID воронки (0 — основная воронка)', optional: true },
    },
  },
  {
    name: 'bitrix_deal_userfield_list',
    description: 'Получить список пользовательских полей сделок.',
    parameters: {},
  },
  {
    name: 'bitrix_deal_userfield_add',
    description: 'Добавить пользовательское поле для сделок.',
    parameters: {
      fields: { type: 'object', description: 'Поля для создания (обязательно FIELD_NAME, USER_TYPE_ID)' },
    },
  },
];

export const buildDealRequest = (toolName, args) => {
  switch (toolName) {
    case 'bitrix_deal_list': {
      const filter = ensureObject(args.filter, 'filter must be an object') || {};
      const select = ensureArray(args.select, 'select must be an array') || ['*'];
      const order = ensureObject(args.order, 'order must be an object') || {};
      const start = ensureNumber(args.start, 'start must be a number') || 0;
      return { method: 'crm.deal.list', payload: { filter, select, order, start } };
    }
    case 'bitrix_deal_get': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.deal.get', payload: { id } };
    }
    case 'bitrix_deal_add': {
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || !fields.TITLE) {
        throw new BadRequestError('fields.TITLE is required');
      }
      return { method: 'crm.deal.add', payload: { fields } };
    }
    case 'bitrix_deal_update': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || Object.keys(fields).length === 0) {
        throw new BadRequestError('fields must include at least one field');
      }
      return { method: 'crm.deal.update', payload: { id, fields } };
    }
    case 'bitrix_deal_delete': {
      const id = ensurePositiveNumber(args.id, 'id must be a positive number');
      return { method: 'crm.deal.delete', payload: { id } };
    }
    case 'bitrix_deal_fields': {
      return { method: 'crm.deal.fields', payload: {} };
    }
    case 'bitrix_deal_category_list': {
      return { method: 'crm.dealcategory.list', payload: {} };
    }
    case 'bitrix_deal_stage_list': {
      const categoryId = ensureNumber(args.categoryId, 'categoryId must be a number') ?? 0;
      return { method: 'crm.dealcategory.stage.list', payload: { id: categoryId } };
    }
    case 'bitrix_deal_userfield_list': {
      return { method: 'crm.deal.userfield.list', payload: {} };
    }
    case 'bitrix_deal_userfield_add': {
      const fields = ensureObject(args.fields, 'fields must be an object');
      if (!fields || !fields.FIELD_NAME || !fields.USER_TYPE_ID) {
        throw new BadRequestError('fields.FIELD_NAME and fields.USER_TYPE_ID are required');
      }
      return { method: 'crm.deal.userfield.add', payload: { fields } };
    }
    default:
      return null;
  }
};
