import { buildActivityRequest, activityTools } from '../../mcp/tools/activities.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Activity Tools', () => {
  describe('Tool definitions', () => {
    test('activityTools has 6 tools', () => {
      expect(activityTools.length).toBe(6);
    });
  });

  describe('buildActivityRequest', () => {
    test('bitrix_activity_list builds correct payload with defaults', () => {
      const result = buildActivityRequest('bitrix_activity_list', {});
      expect(result).toEqual({
        method: 'crm.activity.list',
        payload: { filter: {}, select: ['*'], order: {}, start: 0 },
      });
    });

    test('bitrix_activity_get builds correct payload', () => {
      const result = buildActivityRequest('bitrix_activity_get', { id: 123 });
      expect(result).toEqual({ method: 'crm.activity.get', payload: { id: 123 } });
    });

    test('bitrix_activity_add builds correct payload', () => {
      const result = buildActivityRequest('bitrix_activity_add', {
        fields: { OWNER_TYPE_ID: 2, OWNER_ID: 10, TYPE_ID: 1, SUBJECT: 'Call' },
      });
      expect(result).toEqual({
        method: 'crm.activity.add',
        payload: { fields: { OWNER_TYPE_ID: 2, OWNER_ID: 10, TYPE_ID: 1, SUBJECT: 'Call' } },
      });
    });

    test('bitrix_activity_add throws without required fields', () => {
      expect(() => buildActivityRequest('bitrix_activity_add', {
        fields: { SUBJECT: 'Call' },
      })).toThrow(BadRequestError);
    });

    test('bitrix_activity_update builds correct payload', () => {
      const result = buildActivityRequest('bitrix_activity_update', {
        id: 55,
        fields: { COMPLETED: 'Y' },
      });
      expect(result).toEqual({
        method: 'crm.activity.update',
        payload: { id: 55, fields: { COMPLETED: 'Y' } },
      });
    });

    test('bitrix_activity_delete builds correct payload', () => {
      const result = buildActivityRequest('bitrix_activity_delete', { id: 42 });
      expect(result).toEqual({ method: 'crm.activity.delete', payload: { id: 42 } });
    });

    test('bitrix_activity_fields builds correct payload', () => {
      const result = buildActivityRequest('bitrix_activity_fields', {});
      expect(result).toEqual({ method: 'crm.activity.fields', payload: {} });
    });

    test('returns null for unknown tool', () => {
      const result = buildActivityRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
