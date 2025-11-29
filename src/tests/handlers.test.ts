import { Request, Response } from 'express';
import { callTool, listTools, ping } from '../mcp/handlers.js';
import { toolNames } from '../mcp/tools.js';
import { bitrix } from '../bitrix/client.js';

jest.mock('../bitrix/client.js', () => {
  const post = jest.fn();
  return {
    bitrix: {
      defaults: { baseURL: 'https://example.test' },
      post,
    },
  };
});

type MockResponse = Response & { payload?: unknown; statusCode: number };

const createMockResponse = (): MockResponse => {
  const res = {
    statusCode: 200,
    status: jest.fn(function status(code: number) {
      res.statusCode = code;
      return res;
    }),
    json: jest.fn(function json(payload: unknown) {
      res.payload = payload;
      return res;
    }),
    setHeader: jest.fn(),
  } as unknown as MockResponse;

  return res;
};

const createMockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: {},
    ...overrides,
  } as unknown as Request);

describe('MCP handlers', () => {
  beforeEach(() => {
    (bitrix.post as jest.Mock).mockReset();
  });

  test('ping returns ok true', () => {
    const res = createMockResponse();
    ping({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test('listTools exposes tool names', () => {
    const res = createMockResponse();
    listTools({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({ tools: toolNames });
  });

  test('callTool proxies Bitrix response result', async () => {
    const res = createMockResponse();
    (bitrix.post as jest.Mock).mockResolvedValue({ data: { result: { ID: '5' } } });

    await callTool(
      createMockRequest({ body: { tool: 'bitrix_get_deal', args: { id: 5 } } }),
      res,
    );

    expect(bitrix.post).toHaveBeenCalledWith('https://example.test/crm.deal.get.json', { id: 5 });
    expect(res.json).toHaveBeenCalledWith({ result: { ID: '5' } });
  });

  test('callTool rejects non-JSON requests', async () => {
    const res = createMockResponse();

    await callTool(createMockRequest({ headers: {} as Record<string, string> }), res);

    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Content-Type must be application/json', code: 'UNSUPPORTED_MEDIA_TYPE' },
    });
  });

  test('callTool returns bad request for unknown tool', async () => {
    const res = createMockResponse();

    await callTool(
      createMockRequest({ body: { tool: 'unknown' } }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: { message: 'Unknown tool: unknown', code: 'BAD_REQUEST' } });
  });
});
