export default function handler(req, res) {
  res.status(200).json({
    name: "bitrix24-mcp-proxy",
    version: "1.0.0",
    description: "MCP Proxy for Bitrix24",
    endpoints: {
      ping: "/mcp/ping",
      list_tools: "/mcp/list_tools",
      call_tool: "/mcp/call_tool",
      servers: "/servers"
    }
  });
}
