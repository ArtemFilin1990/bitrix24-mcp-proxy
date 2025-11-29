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

  test('throws when tool name is empty', () => {
    expect(() => buildBitrixRequest('', {})).toThrow(BadRequestError);
    expect(() => buildBitrixRequest('', {})).toThrow('Tool name is required');
  });

  test('throws when fields is array instead of object', () => {
    expect(() => buildBitrixRequest('bitrix_create_deal', { title: 'Test', fields: [1, 2, 3] })).toThrow(BadRequestError);
    expect(() => buildBitrixRequest('bitrix_create_deal', { title: 'Test', fields: [1, 2, 3] })).toThrow('Parameter "fields" must be an object when provided');
  });

  test('throws when title is empty string for create_deal', () => {
    expect(() => buildBitrixRequest('bitrix_create_deal', { title: '   ' })).toThrow(BadRequestError);
    expect(() => buildBitrixRequest('bitrix_create_deal', { title: '   ' })).toThrow('Parameter "title" must be a non-empty string');
  });

  test('throws when update_deal fields is empty object', () => {
    expect(() => buildBitrixRequest('bitrix_update_deal', { id: 1, fields: {} })).toThrow(BadRequestError);
    expect(() => buildBitrixRequest('bitrix_update_deal', { id: 1, fields: {} })).toThrow('Parameter "fields" must include at least one field');
  });

  test('throws when update_contact fields is empty object', () => {
    expect(() => buildBitrixRequest('bitrix_update_contact', { id: 1, fields: {} })).toThrow(BadRequestError);
    expect(() => buildBitrixRequest('bitrix_update_contact', { id: 1, fields: {} })).toThrow('Parameter "fields" must include at least one field');
  });

  test('creates contact with email only', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_contact', {
      firstName: 'John',
      email: 'john@example.com',
    });

    expect(method).toBe('crm.contact.add');
    expect(payload).toEqual({
      fields: {
        NAME: 'John',
        EMAIL: [{ VALUE: 'john@example.com', VALUE_TYPE: 'WORK' }],
      },
    });
  });

  test('finds contact with phone only', () => {
    const { method, payload } = buildBitrixRequest('bitrix_find_contact', {
      phone: '+15550000001',
    });

    expect(method).toBe('crm.contact.list');
    expect(payload).toEqual({
      filter: { PHONE: '+15550000001' },
      select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
    });
  });

  test('finds contact with email only', () => {
    const { method, payload } = buildBitrixRequest('bitrix_find_contact', {
      email: 'test@example.com',
    });

    expect(method).toBe('crm.contact.list');
    expect(payload).toEqual({
      filter: { EMAIL: 'test@example.com' },
      select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
    });
  });

  test('creates deal without optional fields', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_deal', {
      title: 'New deal',
    });

    expect(method).toBe('crm.deal.add');
    expect(payload).toEqual({ fields: { TITLE: 'New deal' } });
  });

  test('creates contact with only firstName', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_contact', {
      firstName: 'Jane',
    });

    expect(method).toBe('crm.contact.add');
    expect(payload).toEqual({ fields: { NAME: 'Jane' } });
  });

  test('handles non-object args gracefully', () => {
    // When args is not an object (like array), should be normalized to empty object
    // This will throw because id is required (after normalization)
    expect(() => buildBitrixRequest('bitrix_get_deal', [1, 2, 3] as unknown as Record<string, unknown>)).toThrow(BadRequestError);
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

  test('POST /mcp/call_tool handles invalid JSON syntax', async () => {
    const app = await createApp();

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { message: 'Invalid JSON payload' } });
  });

  test('POST /mcp/call_tool rejects non-object body', async () => {
    const app = await createApp();

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send([1, 2, 3]);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { message: 'Request body must be a JSON object' } });
  });

  test('POST /mcp/call_tool handles upstream 500 error', async () => {
    const app = await createApp();

    nock(BITRIX_BASE)
      .post(`${BITRIX_PATH}crm.deal.get.json`, { id: 42 })
      .reply(500, { error: 'Internal server error' });

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send({ tool: 'bitrix_get_deal', args: { id: 42 } });

    expect(response.status).toBe(500);
  });

  test('POST /mcp/call_tool handles upstream 400 error as 502', async () => {
    const app = await createApp();

    nock(BITRIX_BASE)
      .post(`${BITRIX_PATH}crm.deal.get.json`, { id: 42 })
      .reply(400, { error: 'Bad request from Bitrix' });

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send({ tool: 'bitrix_get_deal', args: { id: 42 } });

    expect(response.status).toBe(502);
  });

  test('POST /mcp/call_tool returns response data when no result field', async () => {
    const app = await createApp();

    nock(BITRIX_BASE)
      .post(`${BITRIX_PATH}crm.deal.get.json`, { id: 42 })
      .reply(200, { data: 'custom response' });

    const response = await request(app)
      .post('/mcp/call_tool')
      .set('Content-Type', 'application/json')
      .send({ tool: 'bitrix_get_deal', args: { id: 42 } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: { data: 'custom response' } });
  });
});
