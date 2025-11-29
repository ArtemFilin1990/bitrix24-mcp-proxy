import { buildDealRequest, dealTools } from '../../mcp/tools/deals.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Deal Tools', () => {
  describe('Tool definitions', () => {
    test('dealTools has 10 tools', () => {
      expect(dealTools.length).toBe(10);
    });

    test('all tools have required properties', () => {
      dealTools.forEach((tool) => {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.parameters).toBeDefined();
      });
    });
  });

  describe('buildDealRequest', () => {
    test('bitrix_deal_list builds correct payload with defaults', () => {
      const result = buildDealRequest('bitrix_deal_list', {});
      expect(result).toEqual({
        method: 'crm.deal.list',
        payload: { filter: {}, select: ['*'], order: {}, start: 0 },
      });
    });

    test('bitrix_deal_list builds correct payload with filters', () => {
      const result = buildDealRequest('bitrix_deal_list', {
        filter: { STAGE_ID: 'WON' },
        select: ['ID', 'TITLE'],
        order: { DATE_CREATE: 'DESC' },
        start: 50,
      });
      expect(result).toEqual({
        method: 'crm.deal.list',
        payload: {
          filter: { STAGE_ID: 'WON' },
          select: ['ID', 'TITLE'],
          order: { DATE_CREATE: 'DESC' },
          start: 50,
        },
      });
    });

    test('bitrix_deal_get builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_get', { id: 123 });
      expect(result).toEqual({ method: 'crm.deal.get', payload: { id: 123 } });
    });

    test('bitrix_deal_get throws on invalid id', () => {
      expect(() => buildDealRequest('bitrix_deal_get', { id: 'abc' })).toThrow(BadRequestError);
      expect(() => buildDealRequest('bitrix_deal_get', { id: -1 })).toThrow(BadRequestError);
      expect(() => buildDealRequest('bitrix_deal_get', {})).toThrow(BadRequestError);
    });

    test('bitrix_deal_add builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_add', {
        fields: { TITLE: 'Test Deal', OPPORTUNITY: 1000 },
      });
      expect(result).toEqual({
        method: 'crm.deal.add',
        payload: { fields: { TITLE: 'Test Deal', OPPORTUNITY: 1000 } },
      });
    });

    test('bitrix_deal_add throws without TITLE', () => {
      expect(() => buildDealRequest('bitrix_deal_add', { fields: { OPPORTUNITY: 1000 } })).toThrow(BadRequestError);
    });

    test('bitrix_deal_update builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_update', {
        id: 55,
        fields: { STAGE_ID: 'WON' },
      });
      expect(result).toEqual({
        method: 'crm.deal.update',
        payload: { id: 55, fields: { STAGE_ID: 'WON' } },
      });
    });

    test('bitrix_deal_update throws with empty fields', () => {
      expect(() => buildDealRequest('bitrix_deal_update', { id: 55, fields: {} })).toThrow(BadRequestError);
    });

    test('bitrix_deal_delete builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_delete', { id: 42 });
      expect(result).toEqual({ method: 'crm.deal.delete', payload: { id: 42 } });
    });

    test('bitrix_deal_fields builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_fields', {});
      expect(result).toEqual({ method: 'crm.deal.fields', payload: {} });
    });

    test('bitrix_deal_category_list builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_category_list', {});
      expect(result).toEqual({ method: 'crm.dealcategory.list', payload: {} });
    });

    test('bitrix_deal_stage_list builds correct payload with default categoryId', () => {
      const result = buildDealRequest('bitrix_deal_stage_list', {});
      expect(result).toEqual({ method: 'crm.dealcategory.stage.list', payload: { id: 0 } });
    });

    test('bitrix_deal_stage_list builds correct payload with categoryId', () => {
      const result = buildDealRequest('bitrix_deal_stage_list', { categoryId: 5 });
      expect(result).toEqual({ method: 'crm.dealcategory.stage.list', payload: { id: 5 } });
    });

    test('bitrix_deal_userfield_list builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_userfield_list', {});
      expect(result).toEqual({ method: 'crm.deal.userfield.list', payload: {} });
    });

    test('bitrix_deal_userfield_add builds correct payload', () => {
      const result = buildDealRequest('bitrix_deal_userfield_add', {
        fields: { FIELD_NAME: 'MY_FIELD', USER_TYPE_ID: 'string' },
      });
      expect(result).toEqual({
        method: 'crm.deal.userfield.add',
        payload: { fields: { FIELD_NAME: 'MY_FIELD', USER_TYPE_ID: 'string' } },
      });
    });

    test('bitrix_deal_userfield_add throws without required fields', () => {
      expect(() => buildDealRequest('bitrix_deal_userfield_add', { fields: { FIELD_NAME: 'MY_FIELD' } })).toThrow(BadRequestError);
    });

    test('returns null for unknown tool', () => {
      const result = buildDealRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
