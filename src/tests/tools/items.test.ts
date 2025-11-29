import { buildItemRequest, itemTools } from '../../mcp/tools/items.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Item Tools (Smart Processes)', () => {
  describe('Tool definitions', () => {
    test('itemTools has 8 tools', () => {
      expect(itemTools.length).toBe(8);
    });
  });

  describe('buildItemRequest', () => {
    test('bitrix_item_list builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_list', { entityTypeId: 128 });
      expect(result).toEqual({
        method: 'crm.item.list',
        payload: { entityTypeId: 128, filter: {}, select: ['*'], order: {}, start: 0 },
      });
    });

    test('bitrix_item_list throws without entityTypeId', () => {
      expect(() => buildItemRequest('bitrix_item_list', {})).toThrow(BadRequestError);
    });

    test('bitrix_item_get builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_get', { entityTypeId: 128, id: 10 });
      expect(result).toEqual({
        method: 'crm.item.get',
        payload: { entityTypeId: 128, id: 10 },
      });
    });

    test('bitrix_item_add builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_add', {
        entityTypeId: 128,
        fields: { title: 'New Item' },
      });
      expect(result).toEqual({
        method: 'crm.item.add',
        payload: { entityTypeId: 128, fields: { title: 'New Item' } },
      });
    });

    test('bitrix_item_update builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_update', {
        entityTypeId: 128,
        id: 10,
        fields: { title: 'Updated' },
      });
      expect(result).toEqual({
        method: 'crm.item.update',
        payload: { entityTypeId: 128, id: 10, fields: { title: 'Updated' } },
      });
    });

    test('bitrix_item_delete builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_delete', { entityTypeId: 128, id: 10 });
      expect(result).toEqual({
        method: 'crm.item.delete',
        payload: { entityTypeId: 128, id: 10 },
      });
    });

    test('bitrix_item_fields builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_fields', { entityTypeId: 128 });
      expect(result).toEqual({
        method: 'crm.item.fields',
        payload: { entityTypeId: 128 },
      });
    });

    test('bitrix_item_type_list builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_type_list', {});
      expect(result).toEqual({ method: 'crm.type.list', payload: {} });
    });

    test('bitrix_item_type_get builds correct payload', () => {
      const result = buildItemRequest('bitrix_item_type_get', { id: 128 });
      expect(result).toEqual({ method: 'crm.type.get', payload: { id: 128 } });
    });

    test('returns null for unknown tool', () => {
      const result = buildItemRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
