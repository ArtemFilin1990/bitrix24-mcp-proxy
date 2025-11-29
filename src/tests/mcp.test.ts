import { BadRequestError, buildBitrixRequest, tools } from '../mcp/tools.js';

describe('MCP tool definitions', () => {
  test('exposes both Bitrix24 tools', () => {
    const toolNames = tools.map((tool) => tool.name);
    expect(toolNames).toContain('bitrix_get_deal');
    expect(toolNames).toContain('bitrix_create_deal');
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
});
