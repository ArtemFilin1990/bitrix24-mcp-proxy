import request from 'supertest';
import nock from 'nock';
import { BadRequestError, buildBitrixRequest, tools, getToolNames } from '../mcp/tools.js';

const BITRIX_BASE = 'https://example.bitrix.test';
const BITRIX_PATH = '/rest/1/abc/';

describe('MCP tool definitions', () => {
  test('exposes full tool definitions with metadata', () => {
    const names = tools.map((tool) => tool.name);

    // Check that we have at least the expected number of tools (60+)
    expect(names.length).toBeGreaterThanOrEqual(54);

    // Verify original 13 tools are still present
    const originalTools = [
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
    ];

    originalTools.forEach((toolName) => {
      expect(names).toContain(toolName);
    });

    // Verify new tools are present
    const newTools = [
      // Deals
      'bitrix_list_deals',
      'bitrix_get_deal_categories',
      'bitrix_get_deal_stages',
      'bitrix_filter_deals_by_pipeline',
      'bitrix_filter_deals_by_budget',
      'bitrix_filter_deals_by_status',
      'bitrix_get_latest_deals',
      'bitrix_get_deal_fields',
      // Leads
      'bitrix_update_lead',
      'bitrix_list_leads',
      'bitrix_search_leads',
      'bitrix_get_lead_statuses',
      'bitrix_get_latest_leads',
      'bitrix_get_leads_from_date_range',
      'bitrix_get_lead_fields',
      // Contacts
      'bitrix_list_contacts',
      'bitrix_search_contacts',
      'bitrix_get_contact_fields',
      // Companies
      'bitrix_update_company',
      'bitrix_list_companies',
      'bitrix_search_companies',
      'bitrix_get_latest_companies',
      'bitrix_get_company_fields',
      // Tasks
      'bitrix_create_task',
      'bitrix_get_task',
      'bitrix_update_task',
      'bitrix_list_tasks',
      'bitrix_get_task_comments',
      'bitrix_add_task_comment',
      'bitrix_get_task_checklist',
      // Activities
      'bitrix_create_activity',
      'bitrix_get_activity',
      'bitrix_list_activities',
      'bitrix_update_activity',
      'bitrix_complete_activity',
      // Users
      'bitrix_list_users',
      'bitrix_get_user',
      'bitrix_get_current_user',
      'bitrix_get_user_activity',
      // Utils
      'bitrix_get_timeline',
      'bitrix_add_timeline_comment',
      'bitrix_get_status_list',
      'bitrix_get_call_statistics',
      'bitrix_get_file',
      'bitrix_upload_file',
      'bitrix_validate_webhook',
      'bitrix_diagnose_permissions',
      'bitrix_check_crm_settings',
      'bitrix_get_crm_summary',
    ];

    newTools.forEach((toolName) => {
      expect(names).toContain(toolName);
    });

    tools.forEach((tool) => {
      expect(tool.description).toBeTruthy();
      expect(tool.parameters).toBeDefined();
    });
  });

  test('getToolNames returns same names as tools array', () => {
    const namesFromTools = tools.map((tool) => tool.name);
    const namesFromFunction = getToolNames();
    expect(namesFromFunction).toEqual(namesFromTools);
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

  // Tests for new deal tools
  test('builds crm.deal.list payload for bitrix_list_deals', () => {
    const { method, payload } = buildBitrixRequest('bitrix_list_deals', {
      filter: { STAGE_ID: 'NEW' },
      order: { DATE_CREATE: 'DESC' },
      start: 0,
      limit: 25,
    });
    expect(method).toBe('crm.deal.list');
    expect(payload).toEqual({
      filter: { STAGE_ID: 'NEW' },
      order: { DATE_CREATE: 'DESC' },
      start: 0,
      limit: 25,
    });
  });

  test('builds crm.dealcategory.list payload for bitrix_get_deal_categories', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_deal_categories', {});
    expect(method).toBe('crm.dealcategory.list');
    expect(payload).toEqual({});
  });

  test('builds crm.dealcategory.stage.list payload for bitrix_get_deal_stages', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_deal_stages', { categoryId: 1 });
    expect(method).toBe('crm.dealcategory.stage.list');
    expect(payload).toEqual({ id: 1 });
  });

  test('builds crm.deal.list payload for bitrix_filter_deals_by_budget', () => {
    const { method, payload } = buildBitrixRequest('bitrix_filter_deals_by_budget', {
      minBudget: 1000,
      maxBudget: 50000,
    });
    expect(method).toBe('crm.deal.list');
    expect(payload).toEqual({
      filter: { '>=OPPORTUNITY': 1000, '<=OPPORTUNITY': 50000 },
      start: 0,
      limit: 50,
    });
  });

  test('throws when no budget parameters provided for bitrix_filter_deals_by_budget', () => {
    expect(() => buildBitrixRequest('bitrix_filter_deals_by_budget', {})).toThrow(BadRequestError);
  });

  test('builds crm.deal.list payload for bitrix_get_latest_deals', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_latest_deals', { limit: 5 });
    expect(method).toBe('crm.deal.list');
    expect(payload).toEqual({
      filter: {},
      order: { DATE_CREATE: 'DESC' },
      start: 0,
      limit: 5,
    });
  });

  test('builds crm.deal.fields payload for bitrix_get_deal_fields', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_deal_fields', {});
    expect(method).toBe('crm.deal.fields');
    expect(payload).toEqual({});
  });

  // Tests for new lead tools
  test('builds crm.lead.update payload for bitrix_update_lead', () => {
    const { method, payload } = buildBitrixRequest('bitrix_update_lead', {
      id: 123,
      fields: { STATUS_ID: 'IN_PROCESS' },
    });
    expect(method).toBe('crm.lead.update');
    expect(payload).toEqual({ id: 123, fields: { STATUS_ID: 'IN_PROCESS' } });
  });

  test('builds crm.lead.list payload for bitrix_list_leads', () => {
    const { method, payload } = buildBitrixRequest('bitrix_list_leads', {
      filter: { STATUS_ID: 'NEW' },
    });
    expect(method).toBe('crm.lead.list');
    expect(payload).toHaveProperty('filter', { STATUS_ID: 'NEW' });
  });

  test('builds crm.status.list payload for bitrix_get_lead_statuses', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_lead_statuses', {});
    expect(method).toBe('crm.status.list');
    expect(payload).toEqual({ filter: { ENTITY_ID: 'STATUS' } });
  });

  test('builds crm.lead.list payload for bitrix_get_leads_from_date_range', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_leads_from_date_range', {
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
    });
    expect(method).toBe('crm.lead.list');
    expect(payload).toEqual({
      filter: { '>=DATE_CREATE': '2024-01-01', '<=DATE_CREATE': '2024-01-31' },
      order: { DATE_CREATE: 'DESC' },
      start: 0,
      limit: 50,
    });
  });

  // Tests for new contact tools
  test('builds crm.contact.list payload for bitrix_list_contacts', () => {
    const { method, payload } = buildBitrixRequest('bitrix_list_contacts', {
      filter: { COMPANY_ID: 1 },
    });
    expect(method).toBe('crm.contact.list');
    expect(payload).toHaveProperty('filter', { COMPANY_ID: 1 });
  });

  test('builds crm.contact.list payload for bitrix_search_contacts', () => {
    const { method, payload } = buildBitrixRequest('bitrix_search_contacts', {
      name: 'John',
    });
    expect(method).toBe('crm.contact.list');
    expect(payload).toEqual({ filter: { '%NAME': 'John' }, start: 0, limit: 50 });
  });

  test('throws when no search params for bitrix_search_contacts', () => {
    expect(() => buildBitrixRequest('bitrix_search_contacts', {})).toThrow(BadRequestError);
  });

  // Tests for new company tools
  test('builds crm.company.update payload for bitrix_update_company', () => {
    const { method, payload } = buildBitrixRequest('bitrix_update_company', {
      id: 123,
      fields: { INDUSTRY: 'IT' },
    });
    expect(method).toBe('crm.company.update');
    expect(payload).toEqual({ id: 123, fields: { INDUSTRY: 'IT' } });
  });

  test('builds crm.company.list payload for bitrix_search_companies', () => {
    const { method, payload } = buildBitrixRequest('bitrix_search_companies', {
      query: 'ACME',
    });
    expect(method).toBe('crm.company.list');
    expect(payload).toEqual({ filter: { '%TITLE': 'ACME' }, start: 0, limit: 50 });
  });

  // Tests for task tools
  test('builds tasks.task.add payload for bitrix_create_task', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_task', {
      title: 'Test Task',
      responsibleId: 1,
      description: 'Task description',
    });
    expect(method).toBe('tasks.task.add');
    expect(payload).toEqual({
      fields: {
        TITLE: 'Test Task',
        RESPONSIBLE_ID: 1,
        DESCRIPTION: 'Task description',
      },
    });
  });

  test('builds tasks.task.get payload for bitrix_get_task', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_task', { id: 123 });
    expect(method).toBe('tasks.task.get');
    expect(payload).toEqual({ taskId: 123 });
  });

  test('builds task.commentitem.add payload for bitrix_add_task_comment', () => {
    const { method, payload } = buildBitrixRequest('bitrix_add_task_comment', {
      taskId: 123,
      comment: 'Test comment',
    });
    expect(method).toBe('task.commentitem.add');
    expect(payload).toEqual({ TASKID: 123, FIELDS: { POST_MESSAGE: 'Test comment' } });
  });

  // Tests for activity tools
  test('builds crm.activity.add payload for bitrix_create_activity', () => {
    const { method, payload } = buildBitrixRequest('bitrix_create_activity', {
      ownerType: 'deal',
      ownerId: 123,
      typeId: 2,
      subject: 'Phone call',
    });
    expect(method).toBe('crm.activity.add');
    expect(payload).toEqual({
      fields: {
        OWNER_TYPE_ID: 2,
        OWNER_ID: 123,
        TYPE_ID: 2,
        SUBJECT: 'Phone call',
      },
    });
  });

  test('builds crm.activity.update payload for bitrix_complete_activity', () => {
    const { method, payload } = buildBitrixRequest('bitrix_complete_activity', { id: 123 });
    expect(method).toBe('crm.activity.update');
    expect(payload).toEqual({ id: 123, fields: { COMPLETED: 'Y' } });
  });

  // Tests for user tools
  test('builds user.current payload for bitrix_get_current_user', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_current_user', {});
    expect(method).toBe('user.current');
    expect(payload).toEqual({});
  });

  test('builds user.get payload for bitrix_get_user', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_user', { id: 1 });
    expect(method).toBe('user.get');
    expect(payload).toEqual({ ID: 1 });
  });

  // Tests for utility tools
  test('builds crm.timeline.comment.list payload for bitrix_get_timeline', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_timeline', {
      entityType: 'deal',
      entityId: 123,
    });
    expect(method).toBe('crm.timeline.comment.list');
    expect(payload).toEqual({
      filter: { ENTITY_ID: 123, ENTITY_TYPE: 'DEAL' },
      start: 0,
      limit: 50,
    });
  });

  test('builds crm.status.list payload for bitrix_get_status_list', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_status_list', {
      entityId: 'DEAL_STAGE',
    });
    expect(method).toBe('crm.status.list');
    expect(payload).toEqual({ filter: { ENTITY_ID: 'DEAL_STAGE' } });
  });

  test('builds user.current payload for bitrix_validate_webhook', () => {
    const { method, payload } = buildBitrixRequest('bitrix_validate_webhook', {});
    expect(method).toBe('user.current');
    expect(payload).toEqual({});
  });

  test('builds scope payload for bitrix_diagnose_permissions', () => {
    const { method, payload } = buildBitrixRequest('bitrix_diagnose_permissions', {});
    expect(method).toBe('scope');
    expect(payload).toEqual({});
  });

  test('builds batch payload for bitrix_get_crm_summary', () => {
    const { method, payload } = buildBitrixRequest('bitrix_get_crm_summary', {});
    expect(method).toBe('batch');
    expect(payload).toHaveProperty('cmd');
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
