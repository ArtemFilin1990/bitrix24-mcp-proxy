/**
 * Bitrix24 MCP Tools
 *
 * This file re-exports all tools from the modular structure for backward compatibility.
 * For new development, import from './tools/index.js' directly.
 */

// Re-export everything from the modular structure
export { BadRequestError, toolDefinitions, tools, buildBitrixRequest, getToolNames, getToolByName } from './tools/index.js';

// Type alias for backward compatibility
export type { ToolDefinition, BitrixRequest } from './tools/index.js';
