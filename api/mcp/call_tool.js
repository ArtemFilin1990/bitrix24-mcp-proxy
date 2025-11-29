import { buildBitrixRequest } from './tools.js';
import { postToBitrix } from './bitrix.js';
import { BadRequestError } from './errors.js';

const respondWithError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ error: { message, code } });
};

const isJsonRequest = (req) => {
  const contentType = req.headers['content-type'] || '';
  return contentType.toLowerCase().includes('application/json');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return respondWithError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  if (!isJsonRequest(req)) {
    return respondWithError(res, 415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE');
  }

  try {
    const { tool, args } = req.body ?? {};
    const { method, payload } = buildBitrixRequest(tool, args);
    const result = await postToBitrix(method, payload);
    const unwrapped = result && typeof result === 'object' && 'result' in result ? result.result : result;
    return res.status(200).json({ result: unwrapped });
  } catch (error) {
    const statusCode = error?.statusCode || (error instanceof BadRequestError ? 400 : 500);
    const message = error?.message || 'Unknown error';
    const code = error?.code || (error instanceof BadRequestError ? 'BAD_REQUEST' : 'INTERNAL_ERROR');
    return respondWithError(res, statusCode, message, code);
  }
}
