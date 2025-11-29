import { ConfigurationError, UpstreamError } from './errors.js';
import { resolveWebhookBase } from './tools.js';

const buildBitrixUrl = (method) => {
  const webhookBase = resolveWebhookBase();
  return `${webhookBase}/${method}.json`;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

export const postToBitrix = async (method, payload) => {
  const url = buildBitrixUrl(method);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload ?? {}),
    });
  } catch (error) {
    throw new ConfigurationError(`Failed to reach Bitrix24: ${error.message}`);
  }

  const body = await parseResponseBody(response);

  if (!response.ok) {
    const message = typeof body === 'string' ? body : JSON.stringify(body);
    throw new UpstreamError(`Bitrix24 responded with status ${response.status}: ${message}`, response.status);
  }

  return body;
};
