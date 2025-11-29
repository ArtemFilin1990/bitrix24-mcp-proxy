import request from 'supertest';
import nock from 'nock';
import { BadRequestError, buildBitrixRequest, tools } from '../mcp/tools.js';

const BITRIX_BASE = 'https://example.bitrix.test';
const BITRIX_PATH = '/rest/1/abc/';

describe('MCP tool definitions', () => {
  test('exposes full tool definitions with metadata', () => {
    const names = tools.map((tool) => tool.name);

    // Check that all expected tools are present (60 total)
    expect(names.length).toBe(60);

    // Check some key tools from each category
    expect(names).toContain('bitrix_deal_list');
    expect(names).toContain('bitrix_deal_get');
    expect(names).toContain('bitrix_lead_list');
    expect(names).toContain('bitrix_contact_list');
    expect(names).toContain('bitrix_company_list');
    expect(names).toContain('bitrix_item_list');
    expect(names).toContain('bitrix_activity_list');
    expect(names).toContain('bitrix_task_list');
    expect(names).toContain('bitrix_user_list');
    expect(names).toContain('bitrix_batch');

    tools.forEach((tool) => {
      expect(tool.description).toBeTruthy();
      expect(tool.parameters).toBeDefined();
    });
  });
});

describe('buildBitrixRequest', () => {
  test('builds crm.deal.get payload for bitrix_deal_get', () => {
    const { method, payload } = buildBitrixRequest('bitrix_deal_get', { id: 123 });

    expect(method).toBe('crm.deal.get');
    expect(payload).toEqual({ id: 123 });
  });

  test('builds crm.deal.add payload for bitrix_deal_add', () => {
    const { method, payload } = buildBitrixRequest('bitrix_deal_add', {
      fields: { TITLE: 'New deal', COMMENTS: 'Test' },
    });

    expect(method).toBe('crm.deal.add');
    expect(payload).toEqual({ fields: { TITLE: 'New deal', COMMENTS: 'Test' } });
  });

  test('builds crm.deal.update payload for bitrix_deal_update', () => {
    const { method, payload } = buildBitrixRequest('bitrix_deal_update', {
      id: 55,
      fields: { STAGE_ID: 'WON' },
    });

    expect(method).toBe('crm.deal.update');
    expect(payload).toEqual({ id: 55, fields: { STAGE_ID: 'WON' } });
  });

  test('builds crm.contact.list payload for bitrix_contact_list', () => {
    const { method, payload } = buildBitrixRequest('bitrix_contact_list', {
      filter: { PHONE: '+15550000000' },
    });

    expect(method).toBe('crm.contact.list');
    expect(payload).toEqual({
      filter: { PHONE: '+15550000000' },
      select: ['*'],
      order: {},
      start: 0,
    });
  });

  test('builds crm.contact.add payload for bitrix_contact_add', () => {
    const { method, payload } = buildBitrixRequest('bitrix_contact_add', {
      fields: { NAME: 'Jane', LAST_NAME: 'Doe', PHONE: [{ VALUE: '+155501', VALUE_TYPE: 'WORK' }] },
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

  test('builds crm.contact.update payload for bitrix_contact_update', () => {
    const { method, payload } = buildBitrixRequest('bitrix_contact_update', {
      id: 999,
      fields: { COMMENTS: 'Updated' },
    });

    expect(method).toBe('crm.contact.update');
    expect(payload).toEqual({ id: 999, fields: { COMMENTS: 'Updated' } });
  });

  test('throws for unsupported tools', () => {
    expect(() => buildBitrixRequest('unknown', {})).toThrow(BadRequestError);
  });

  test('requires phone for contact search by phone', () => {
    expect(() => buildBitrixRequest('bitrix_contact_search_by_phone', {})).toThrow(BadRequestError);
  });

  test('builds crm.deal.list payload for bitrix_deal_list', () => {
    const { method, payload } = buildBitrixRequest('bitrix_deal_list', {
      filter: { STAGE_ID: 'WON' },
    });
    expect(method).toBe('crm.deal.list');
    expect(payload).toEqual({ filter: { STAGE_ID: 'WON' }, select: ['*'], order: {}, start: 0 });
  });

  test('builds crm.deal.list with defaults for bitrix_deal_list', () => {
    const { method, payload } = buildBitrixRequest('bitrix_deal_list', {});
    expect(method).toBe('crm.deal.list');
    expect(payload).toEqual({ filter: {}, select: ['*'], order: {}, start: 0 });
  });

  test('builds crm.timeline.comment.add payload for bitrix_timeline_comment_add', () => {
    const { method, payload } = buildBitrixRequest('bitrix_timeline_comment_add', {
      entityType: 'deal',
      entityId: 123,
      comment: 'Test comment',
    });
    expect(method).toBe('crm.timeline.comment.add');
    expect(payload).toEqual({
      fields: { ENTITY_ID: 123, ENTITY_TYPE: 'deal', COMMENT: 'Test comment' },
    });
  });

  test('rejects invalid entityType for bitrix_timeline_comment_add', () => {
    expect(() =>
      buildBitrixRequest('bitrix_timeline_comment_add', {
        entityType: 'invalid',
        entityId: 1,
        comment: 'test',
      })
    ).toThrow(BadRequestError);
  });

  test('builds crm.contact.get payload for bitrix_contact_get', () => {
    const { method, payload } = buildBitrixRequest('bitrix_contact_get', { id: 456 });
    expect(method).toBe('crm.contact.get');
    expect(payload).toEqual({ id: 456 });
  });

  test('builds crm.company.add payload for bitrix_company_add', () => {
    const { method, payload } = buildBitrixRequest('bitrix_company_add', {
      fields: { TITLE: 'ACME Corp', INDUSTRY: 'IT' },
    });
    expect(method).toBe('crm.company.add');
    expect(payload).toEqual({ fields: { TITLE: 'ACME Corp', INDUSTRY: 'IT' } });
  });

  test('builds crm.company.get payload for bitrix_company_get', () => {
    const { method, payload } = buildBitrixRequest('bitrix_company_get', { id: 789 });
    expect(method).toBe('crm.company.get');
    expect(payload).toEqual({ id: 789 });
  });

  test('builds crm.lead.add payload for bitrix_lead_add', () => {
    const { method, payload } = buildBitrixRequest('bitrix_lead_add', {
      fields: { TITLE: 'New Lead', SOURCE_ID: 'WEB' },
    });
    expect(method).toBe('crm.lead.add');
    expect(payload).toEqual({ fields: { TITLE: 'New Lead', SOURCE_ID: 'WEB' } });
  });

  test('builds crm.lead.get payload for bitrix_lead_get', () => {
    const { method, payload } = buildBitrixRequest('bitrix_lead_get', { id: 101 });
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
      .send({ tool: 'bitrix_deal_get', args: { id: 42 } });

    expect(response.body).toEqual({ result: { ID: '42', TITLE: 'Demo' } });
    expect(response.status).toBe(200);
    expect(scope.isDone()).toBe(true);
  });

  test('POST /mcp/call_tool rejects invalid payload', async () => {
    const app = await createApp();

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send({ tool: 'bitrix_deal_get', args: { id: 'oops' } });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { message: 'id must be a positive number' } });
  });
});
