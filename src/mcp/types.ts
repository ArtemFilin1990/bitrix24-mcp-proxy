export interface ToolParameter {
  type: string;
  description: string;
  optional?: boolean;
  additionalProperties?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
}

export type McpTool = ToolDefinition;

export interface McpCallPayload {
  tool?: string;
  args?: Record<string, unknown>;
}
