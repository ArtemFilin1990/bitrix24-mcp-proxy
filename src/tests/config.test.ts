describe('Config env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('loads configuration from env variables', async () => {
    process.env.BITRIX_WEBHOOK_URL = 'https://example.bitrix24.test/webhook/';
    process.env.BITRIX_CLIENT_ID = 'client-id';
    process.env.BITRIX_CLIENT_SECRET = 'client-secret';
    process.env.BITRIX_PORTAL_DOMAIN = 'portal.bitrix24.test';
    process.env.BITRIX_TIMEOUT_MS = '12000';
    process.env.BITRIX_RETRY_COUNT = '4';
    process.env.BITRIX_RETRY_DELAY_MS = '750';
    process.env.MCP_PORT = '4000';
    process.env.NODE_ENV = 'production';

    const { config } = await import('../config/env.js');

    expect(config.bitrixUrl).toBe('https://example.bitrix24.test/webhook/');
    expect(config.bitrixClientId).toBe('client-id');
    expect(config.bitrixClientSecret).toBe('client-secret');
    expect(config.bitrixPortalDomain).toBe('portal.bitrix24.test');
    expect(config.bitrixTimeoutMs).toBe(12000);
    expect(config.bitrixRetryCount).toBe(4);
    expect(config.bitrixRetryDelayMs).toBe(750);
    expect(config.port).toBe(4000);
    expect(config.nodeEnv).toBe('production');
  });

  test('throws error when BITRIX_WEBHOOK_URL is missing', async () => {
    delete process.env.BITRIX_WEBHOOK_URL;

    await expect(import('../config/env.js')).rejects.toThrow(
      'Missing env variable: BITRIX_WEBHOOK_URL'
    );
  });

  test('uses default values for optional variables', async () => {
    process.env.BITRIX_WEBHOOK_URL = 'https://example.bitrix24.test/webhook/';
    delete process.env.BITRIX_CLIENT_ID;
    delete process.env.BITRIX_CLIENT_SECRET;
    delete process.env.BITRIX_PORTAL_DOMAIN;
    delete process.env.BITRIX_TIMEOUT_MS;
    delete process.env.BITRIX_RETRY_COUNT;
    delete process.env.BITRIX_RETRY_DELAY_MS;
    delete process.env.MCP_PORT;
    delete process.env.NODE_ENV;

    const { config } = await import('../config/env.js');

    expect(config.bitrixClientId).toBeUndefined();
    expect(config.bitrixClientSecret).toBeUndefined();
    expect(config.bitrixPortalDomain).toBeUndefined();
    expect(config.bitrixTimeoutMs).toBe(8000);
    expect(config.bitrixRetryCount).toBe(3);
    expect(config.bitrixRetryDelayMs).toBe(500);
    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
  });

  test('parses MCP_PORT as integer', async () => {
    process.env.BITRIX_WEBHOOK_URL = 'https://example.bitrix24.test/webhook/';
    process.env.MCP_PORT = '8080';

    const { config } = await import('../config/env.js');

    expect(config.port).toBe(8080);
    expect(typeof config.port).toBe('number');
  });
});
