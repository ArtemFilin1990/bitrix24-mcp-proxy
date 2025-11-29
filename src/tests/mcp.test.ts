import { BadRequestError, buildBitrixRequest, tools } from '../mcp/tools.js';

describe('MCP tool definitions', () => {
  test('exposes Bitrix24 tools for deals, contacts, comments, and automation', () => {
    const toolNames = tools.map((tool) => tool.name);
    expect(toolNames).toEqual(
      expect.arrayContaining([
        'bitrix_get_deal',
        'bitrix_create_deal',
        'bitrix_update_deal',
        'bitrix_find_contact',
        'bitrix_add_deal_comment',
        'bitrix_trigger_automation',
      ]),
    );
  });
});

describe('buildBitrixRequest', () => {
  test('builds crm.deal.get payload for bitrix_get_deal', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_deal', { id: 123 });

    expect(method).toBe('crm.deal.get');
    expect(payload).toEqual({ id: 123 });
  });

  test('builds crm.deal.add payload for bitrix_create_deal', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_deal', {
      title: 'New deal',
      fields: { COMMENTS: 'Test' },
    });

    expect(method).toBe('crm.deal.add');
    expect(payload).toEqual({ fields: { TITLE: 'New deal', COMMENTS: 'Test' } });
  });

  test('builds crm.deal.update payload for bitrix_update_deal', () => {
    const { method, payload } = buildBitrixRequest('bitrix_update_deal', {
      id: 42,
      fields: { STAGE_ID: 'WON', OPPORTUNITY: 1000 },
    });

    expect(method).toBe('crm.deal.update');
    expect(payload).toEqual({ id: 42, fields: { STAGE_ID: 'WON', OPPORTUNITY: 1000 } });
  });

  test('builds crm.contact.list payload for bitrix_find_contact', () => {
    const { method, payload } = buildBitrixRequest('bitrix_find_contact', { phone: '+123', email: 'test@example.com' });

    expect(method).toBe('crm.contact.list');
    expect(payload).toEqual({
      filter: { PHONE: '+123', EMAIL: 'test@example.com' },
      select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL', 'ASSIGNED_BY_ID'],
    });
  });

  test('builds crm.timeline.comment.add payload for bitrix_add_deal_comment', () => {
    const { method, payload } = buildBitrixRequest('bitrix_add_deal_comment', { id: 7, comment: 'Note' });

    expect(method).toBe('crm.timeline.comment.add');
    expect(payload).toEqual({ fields: { ENTITY_TYPE: 'deal', ENTITY_ID: 7, COMMENT: 'Note' } });
  });

  test('builds crm.automation.trigger payload for bitrix_trigger_automation', () => {
    const { method, payload } = buildBitrixRequest('bitrix_trigger_automation', {
      code: 'AUTO_STAGE',
      entityId: 501,
      entityType: 'deal',
    });

    expect(method).toBe('crm.automation.trigger');
    expect(payload).toEqual({ code: 'AUTO_STAGE', target: 'DEAL_501' });
  });

  test('throws for unsupported tools', () => {
    expect(() => buildBitrixRequest('unknown', {})).toThrow(BadRequestError);
  });

  test('requires positive numeric id for deal fetch', () => {
    expect(() => buildBitrixRequest('bitrix_get_deal', { id: -1 })).toThrow(BadRequestError);
    expect(() => buildBitrixRequest('bitrix_get_deal', { id: '1' })).toThrow(BadRequestError);
  });

  test('requires non-empty title for deal creation', () => {
    expect(() => buildBitrixRequest('bitrix_create_deal', { title: '' })).toThrow(BadRequestError);
  });

  test('requires non-empty fields for deal update', () => {
    expect(() => buildBitrixRequest('bitrix_update_deal', { id: 1, fields: {} })).toThrow(BadRequestError);
  });

  test('requires phone or email for contact search', () => {
    expect(() => buildBitrixRequest('bitrix_find_contact', {})).toThrow(BadRequestError);
  });

  test('rejects unsupported entity types for automation triggers', () => {
    expect(() => buildBitrixRequest('bitrix_trigger_automation', { code: 'X', entityId: 1, entityType: 'task' })).toThrow(
      BadRequestError,
    );
  });
});
