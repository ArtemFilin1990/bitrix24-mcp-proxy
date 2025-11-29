import request from 'supertest';
import nock from 'nock';
import { BadRequestError, buildBitrixRequest, tools } from '../mcp/tools.js';

const BITRIX_BASE = 'https://example.bitrix.test';
const BITRIX_PATH = '/rest/1/abc/';

describe('MCP tool definitions', () => {
  test('exposes all Bitrix tools as string names', () => {
    expect(tools).toEqual([
      'bitrix_get_deal',
      'bitrix_create_deal',
      'bitrix_update_deal',
      'bitrix_find_contact',
      'bitrix_create_contact',
      'bitrix_update_contact',
    ]);
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

  test('GET /mcp/list_tools returns tool names', async () => {
    const app = await createApp();

    const response = await request(app).get('/mcp/list_tools');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ tools });
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
