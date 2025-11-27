export default function handler(req, res) {
  const base = `${req.headers["x-forwarded-proto"]}://${req.headers.host}`;
  
  res.status(200).json({
    servers: [
      {
        name: "bitrix24-mcp",
        description: "MCP Proxy for Bitrix24",
        url: `${base}/mcp`
      }
    ]
  });
}
