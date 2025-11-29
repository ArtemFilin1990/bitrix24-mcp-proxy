import { ConfigurationError } from './errors.js';
import { allToolDefinitions, buildBitrixRequest as buildRequest, BadRequestError } from './tools/index.js';

export { BadRequestError };

export const toolDefinitions = allToolDefinitions;

export const tools = toolDefinitions;

export const buildBitrixRequest = buildRequest;

const normalizeWebhookBase = (webhookUrl) => webhookUrl.replace(/\/$/, '');

export const resolveWebhookBase = () => {
  const webhook = process.env.BITRIX_WEBHOOK_URL;

  if (!webhook) {
    throw new ConfigurationError('Environment variable BITRIX_WEBHOOK_URL is not set');
  }

  return normalizeWebhookBase(webhook);
};
