import { buildBitrixRequest } from './tools.js';
import { postToBitrix } from './bitrix.js';
import { BadRequestError } from './errors.js';
import { corsHeaders, methodNotAllowed, sendError, sendOk, setCors } from './http.js';

const validateJsonRequest = (req, res) => {
  const contentType = req.headers['content-type'] || '';

  if (!contentType.includes('application/json')) {
    sendError(res, 415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE');
    return false;
  }

  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body || '{}');
    } catch (error) {
      sendError(res, 400, 'Invalid JSON payload', 'INVALID_JSON');
      return false;
    }
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    sendError(res, 400, 'Request body must be a JSON object', 'INVALID_PAYLOAD');
    return false;
  }

  return true;
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  setCors(res);

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST', 'OPTIONS']);
  }

  if (!validateJsonRequest(req, res)) {
    return;
  }

  try {
    const { tool, args } = req.body ?? {};
    const { method, payload } = buildBitrixRequest(tool, args);
    const bitrixResponse = await postToBitrix(method, payload);
    const result = bitrixResponse?.result ?? bitrixResponse;
    return sendOk(res, result ?? {});
  } catch (error) {
    const statusCode = error?.statusCode || (error instanceof BadRequestError ? 400 : 500);
    const message = error?.message || 'Unknown error';
    const code = error instanceof BadRequestError ? 'VALIDATION_ERROR' : 'UPSTREAM_ERROR';
    return sendError(res, statusCode, message, code);
  }
}
