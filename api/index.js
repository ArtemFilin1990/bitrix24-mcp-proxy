const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  res.status(200).json({
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
