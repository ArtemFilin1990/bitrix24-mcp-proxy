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

  const base = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

  res.status(200).json({
    servers: [
      {
        name: 'bitrix24-mcp',
        description: 'MCP Proxy for Bitrix24',
        url: `${base}/mcp`,
      },
    ],
  });
}
