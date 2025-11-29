import nock from 'nock';

const BITRIX_BASE = 'https://example.bitrix.test';
const BITRIX_PATH = '/rest/1/abc/';

describe('Bitrix HTTP client', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  beforeEach(() => {
    process.env.BITRIX_WEBHOOK_URL = `${BITRIX_BASE}${BITRIX_PATH}`;
    jest.resetModules();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  test('successful request returns data', async () => {
    const { bitrix } = await import('../bitrix/client.js');

    const scope = nock(BITRIX_BASE)
      .post(`${BITRIX_PATH}crm.deal.get.json`, { id: 1 })
      .reply(200, { result: { ID: '1', TITLE: 'Test Deal' } });

    const response = await bitrix.post(`${BITRIX_BASE}${BITRIX_PATH}crm.deal.get.json`, { id: 1 });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ result: { ID: '1', TITLE: 'Test Deal' } });
    expect(scope.isDone()).toBe(true);
  });

  test('handles HTTP error responses', async () => {
    const { bitrix } = await import('../bitrix/client.js');

    nock(BITRIX_BASE)
      .post(`${BITRIX_PATH}crm.deal.get.json`, { id: 999 })
      .reply(500, { error: 'Internal server error' });

    await expect(
      bitrix.post(`${BITRIX_BASE}${BITRIX_PATH}crm.deal.get.json`, { id: 999 })
    ).rejects.toThrow();
  });

  test('handles network errors', async () => {
    const { bitrix } = await import('../bitrix/client.js');

    nock(BITRIX_BASE)
      .post(`${BITRIX_PATH}crm.deal.get.json`, { id: 1 })
      .replyWithError('Network error');

    await expect(
      bitrix.post(`${BITRIX_BASE}${BITRIX_PATH}crm.deal.get.json`, { id: 1 })
    ).rejects.toThrow();
  });

  test('has correct default configuration', async () => {
    const { bitrix } = await import('../bitrix/client.js');

    expect(bitrix.defaults.baseURL).toBe(`${BITRIX_BASE}${BITRIX_PATH}`);
    expect(bitrix.defaults.timeout).toBe(8000);
    expect(bitrix.defaults.proxy).toBe(false);
  });
});
