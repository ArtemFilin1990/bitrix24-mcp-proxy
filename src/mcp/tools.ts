import { McpTool } from './types.js';
import { allToolDefinitions, buildBitrixRequest as buildRequest, BadRequestError } from './tools/index.js';

export { BadRequestError };

export const toolDefinitions = allToolDefinitions;

export const tools: McpTool[] = toolDefinitions;

export const buildBitrixRequest = buildRequest;
