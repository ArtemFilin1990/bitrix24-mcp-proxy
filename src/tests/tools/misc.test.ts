import { buildMiscRequest, miscTools } from '../../mcp/tools/misc.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Misc Tools', () => {
  describe('Tool definitions', () => {
    test('miscTools has 6 tools', () => {
      expect(miscTools.length).toBe(6);
    });
  });

  describe('buildMiscRequest', () => {
    test('bitrix_timeline_comment_add builds correct payload', () => {
      const result = buildMiscRequest('bitrix_timeline_comment_add', {
        entityType: 'deal',
        entityId: 123,
        comment: 'Test comment',
      });
      expect(result).toEqual({
        method: 'crm.timeline.comment.add',
        payload: {
          fields: {
            ENTITY_ID: 123,
            ENTITY_TYPE: 'deal',
            COMMENT: 'Test comment',
          },
        },
      });
    });

    test('bitrix_timeline_comment_add throws without required fields', () => {
      expect(() => buildMiscRequest('bitrix_timeline_comment_add', { entityType: 'deal' })).toThrow(BadRequestError);
    });

    test('bitrix_timeline_comment_add throws with invalid entityType', () => {
      expect(() => buildMiscRequest('bitrix_timeline_comment_add', {
        entityType: 'invalid',
        entityId: 123,
        comment: 'Test',
      })).toThrow(BadRequestError);
    });

    test('bitrix_batch builds correct payload', () => {
      const result = buildMiscRequest('bitrix_batch', {
        cmd: { deal: 'crm.deal.get?id=1', contact: 'crm.contact.get?id=2' },
      });
      expect(result).toEqual({
        method: 'batch',
        payload: {
          cmd: { deal: 'crm.deal.get?id=1', contact: 'crm.contact.get?id=2' },
          halt: 0,
        },
      });
    });

    test('bitrix_batch with halt=true', () => {
      const result = buildMiscRequest('bitrix_batch', {
        cmd: { deal: 'crm.deal.get?id=1' },
        halt: true,
      });
      expect(result).toEqual({
        method: 'batch',
        payload: {
          cmd: { deal: 'crm.deal.get?id=1' },
          halt: 1,
        },
      });
    });

    test('bitrix_batch throws without cmd', () => {
      expect(() => buildMiscRequest('bitrix_batch', {})).toThrow(BadRequestError);
    });

    test('bitrix_telephony_call_list builds correct payload with defaults', () => {
      const result = buildMiscRequest('bitrix_telephony_call_list', {});
      expect(result).toEqual({
        method: 'voximplant.statistic.get',
        payload: { FILTER: {}, START: 0 },
      });
    });

    test('bitrix_telephony_call_list builds correct payload with sort and order', () => {
      const result = buildMiscRequest('bitrix_telephony_call_list', {
        filter: { CALL_TYPE: 1 },
        sort: 'CALL_START_DATE',
        order: 'DESC',
      });
      expect(result).toEqual({
        method: 'voximplant.statistic.get',
        payload: {
          FILTER: { CALL_TYPE: 1 },
          START: 0,
          SORT: 'CALL_START_DATE',
          ORDER: 'DESC',
        },
      });
    });

    test('bitrix_im_message_add builds correct payload', () => {
      const result = buildMiscRequest('bitrix_im_message_add', {
        dialogId: 'chat123',
        message: 'Hello!',
      });
      expect(result).toEqual({
        method: 'im.message.add',
        payload: { DIALOG_ID: 'chat123', MESSAGE: 'Hello!' },
      });
    });

    test('bitrix_im_message_add throws without required fields', () => {
      expect(() => buildMiscRequest('bitrix_im_message_add', { dialogId: 'chat123' })).toThrow(BadRequestError);
    });

    test('bitrix_crm_status_list builds correct payload without entityId', () => {
      const result = buildMiscRequest('bitrix_crm_status_list', {});
      expect(result).toEqual({
        method: 'crm.status.list',
        payload: {},
      });
    });

    test('bitrix_crm_status_list builds correct payload with entityId', () => {
      const result = buildMiscRequest('bitrix_crm_status_list', { entityId: 'STATUS' });
      expect(result).toEqual({
        method: 'crm.status.list',
        payload: { filter: { ENTITY_ID: 'STATUS' } },
      });
    });

    test('bitrix_webhook_status builds correct payload', () => {
      const result = buildMiscRequest('bitrix_webhook_status', {});
      expect(result).toEqual({ method: 'app.info', payload: {} });
    });

    test('returns null for unknown tool', () => {
      const result = buildMiscRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
