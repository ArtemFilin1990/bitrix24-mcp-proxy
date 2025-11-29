export interface McpTool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface McpCallPayload {
  tool: string;
  args?: Record<string, unknown>;
}
