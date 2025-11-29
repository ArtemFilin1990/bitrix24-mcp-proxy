import request from 'supertest';
import nock from 'nock';
import { BadRequestError, buildBitrixRequest, tools } from '../mcp/tools.js';

const BITRIX_BASE = 'https://example.bitrix.test';
const BITRIX_PATH = '/rest/1/abc/';

describe('MCP tool definitions', () => {
  test('exposes full tool definitions with metadata', () => {
    const names = tools.map((tool) => tool.name);

    expect(names).toEqual([
      'bitrix_get_deal',
      'bitrix_create_deal',
      'bitrix_update_deal',
      'bitrix_find_contact',
      'bitrix_create_contact',
      'bitrix_update_contact',
      'bitrix_search_deals',
      'bitrix_add_comment',
      'bitrix_get_contact',
      'bitrix_create_company',
      'bitrix_get_company',
      'bitrix_create_lead',
      'bitrix_get_lead',
    ]);

    tools.forEach((tool) => {
      expect(tool.description).toBeTruthy();
      expect(tool.parameters).toBeDefined();
    });
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
      id: 55,
      fields: { STAGE_ID: 'WON' },
    });

    expect(method).toBe('crm.deal.update');
    expect(payload).toEqual({ id: 55, fields: { STAGE_ID: 'WON' } });
  });

  test('builds crm.contact.list payload for bitrix_find_contact', () => {
    const { method, payload } = buildBitrixRequest('bitrix_find_contact', {
      phone: '+15550000000',
      email: 'user@example.com',
    });

    expect(method).toBe('crm.contact.list');
    expect(payload).toEqual({
      filter: { PHONE: '+15550000000', EMAIL: 'user@example.com' },
      select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
    });
  });

  test('builds crm.contact.add payload for bitrix_create_contact', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_contact', {
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+155501',
    });

    expect(method).toBe('crm.contact.add');
    expect(payload).toEqual({
      fields: {
        NAME: 'Jane',
        LAST_NAME: 'Doe',
        PHONE: [{ VALUE: '+155501', VALUE_TYPE: 'WORK' }],
      },
    });
  });

  test('builds crm.contact.update payload for bitrix_update_contact', () => {
    const { method, payload } = buildBitrixRequest('bitrix_update_contact', {
      id: 999,
      fields: { COMMENTS: 'Updated' },
    });

    expect(method).toBe('crm.contact.update');
    expect(payload).toEqual({ id: 999, fields: { COMMENTS: 'Updated' } });
  });

  test('throws for unsupported tools', () => {
    expect(() => buildBitrixRequest('unknown', {})).toThrow(BadRequestError);
  });

  test('requires either phone or email for contact search', () => {
    expect(() => buildBitrixRequest('bitrix_find_contact', {})).toThrow(BadRequestError);
  });

  test('builds crm.deal.list payload for bitrix_search_deals', () => {
    const { method, payload } = buildBitrixRequest('bitrix_search_deals', {
      filter: { STAGE_ID: 'WON' },
      limit: 10,
    });
    expect(method).toBe('crm.deal.list');
    expect(payload).toEqual({ filter: { STAGE_ID: 'WON' }, start: 0, limit: 10 });
  });

  test('builds crm.deal.list with default limit for bitrix_search_deals', () => {
    const { method, payload } = buildBitrixRequest('bitrix_search_deals', {});
    expect(method).toBe('crm.deal.list');
    expect(payload).toEqual({ filter: {}, start: 0, limit: 50 });
  });

  test('builds crm.timeline.comment.add payload for bitrix_add_comment', () => {
    const { method, payload } = buildBitrixRequest('bitrix_add_comment', {
      entityType: 'deal',
      entityId: 123,
      comment: 'Test comment',
    });
    expect(method).toBe('crm.timeline.comment.add');
    expect(payload).toEqual({
      fields: { ENTITY_ID: 123, ENTITY_TYPE: 'DEAL', COMMENT: 'Test comment' },
    });
  });

  test('rejects invalid entityType for bitrix_add_comment', () => {
    expect(() =>
      buildBitrixRequest('bitrix_add_comment', {
        entityType: 'invalid',
        entityId: 1,
        comment: 'test',
      })
    ).toThrow(BadRequestError);
  });

  test('builds crm.contact.get payload for bitrix_get_contact', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_contact', { id: 456 });
    expect(method).toBe('crm.contact.get');
    expect(payload).toEqual({ id: 456 });
  });

  test('builds crm.company.add payload for bitrix_create_company', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_company', {
      title: 'ACME Corp',
      fields: { INDUSTRY: 'IT' },
    });
    expect(method).toBe('crm.company.add');
    expect(payload).toEqual({ fields: { TITLE: 'ACME Corp', INDUSTRY: 'IT' } });
  });

  test('builds crm.company.get payload for bitrix_get_company', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_company', { id: 789 });
    expect(method).toBe('crm.company.get');
    expect(payload).toEqual({ id: 789 });
  });

  test('builds crm.lead.add payload for bitrix_create_lead', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_lead', {
      title: 'New Lead',
      fields: { SOURCE_ID: 'WEB' },
    });
    expect(method).toBe('crm.lead.add');
    expect(payload).toEqual({ fields: { TITLE: 'New Lead', SOURCE_ID: 'WEB' } });
  });

  test('builds crm.lead.get payload for bitrix_get_lead', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_lead', { id: 101 });
    expect(method).toBe('crm.lead.get');
    expect(payload).toEqual({ id: 101 });
  });
});

describe('MCP HTTP handlers', () => {
  const createApp = async () => {
    process.env.BITRIX_WEBHOOK_URL = `${BITRIX_BASE}${BITRIX_PATH}`;
    jest.resetModules();
    const { createServer } = await import('../mcp/server.js');
    return createServer();
  };

  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  test('GET /mcp/ping returns ok', async () => {
    const app = await createApp();

    const response = await request(app).get('/mcp/ping');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test('GET /mcp/list_tools returns tool definitions', async () => {
    const app = await createApp();

    const response = await request(app).get('/mcp/list_tools');

    expect(response.status).toBe(200);
    expect(response.body.tools).toEqual(tools);
    response.body.tools.forEach((tool: { name: string; description: string; parameters: object }) => {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('parameters');
    });
  });

  test('POST /mcp/call_tool validates content-type', async () => {
    const app = await createApp();

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'text/plain')
      .send('invalid');

    expect(response.status).toBe(415);
    expect(response.body).toEqual({ error: { message: 'Content-Type must be application/json' } });
  });

  test('POST /mcp/call_tool returns Bitrix result', async () => {
    const app = await createApp();

    const scope = nock(BITRIX_BASE)
      .post(`${BITRIX_PATH}crm.deal.get.json`, { id: 42 })
      .reply(200, { result: { ID: '42', TITLE: 'Demo' } });

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send({ tool: 'bitrix_get_deal', args: { id: 42 } });

    expect(response.body).toEqual({ result: { ID: '42', TITLE: 'Demo' } });
    expect(response.status).toBe(200);
    expect(scope.isDone()).toBe(true);
  });

  test('POST /mcp/call_tool rejects invalid payload', async () => {
    const app = await createApp();

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send({ tool: 'bitrix_get_deal', args: { id: 'oops' } });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { message: 'Parameter "id" must be a positive number' } });
  });
});
