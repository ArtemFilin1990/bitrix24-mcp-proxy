import { corsHeaders, methodNotAllowed, sendOk, setCors } from './mcp/http.js';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  setCors(res);

  const base = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET', 'OPTIONS']);
  }

  return sendOk(res, {
    servers: [
      {
        name: 'bitrix24-mcp',
        description: 'MCP Proxy for Bitrix24',
        url: `${base}/mcp`,
      },
    ],
  });
}
