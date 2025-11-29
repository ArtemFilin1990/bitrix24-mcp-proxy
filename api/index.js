import { corsHeaders, methodNotAllowed, sendOk, setCors } from './mcp/http.js';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  setCors(res);

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET', 'OPTIONS']);
  }

  return sendOk(res, {
    name: 'bitrix24-mcp-proxy',
    version: '1.0.0',
    description: 'MCP Proxy for Bitrix24',
    endpoints: {
      ping: '/mcp/ping',
      list_tools: '/mcp/list_tools',
      call_tool: '/mcp/call_tool',
      servers: '/servers',
    },
  });
}
