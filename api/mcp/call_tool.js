import { buildBitrixRequest } from './tools.js';
import { postToBitrix } from './bitrix.js';
import { BadRequestError } from './errors.js';

const validateJsonRequest = (req, res) => {
  const contentType = req.headers['content-type'] || '';

  if (!contentType.includes('application/json')) {
    res.status(415).json({ error: { message: 'Content-Type must be application/json' } });
    return false;
  }

  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body || '{}');
    } catch (error) {
      res.status(400).json({ error: { message: 'Invalid JSON payload' } });
      return false;
    }
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ error: { message: 'Request body must be a JSON object' } });
    return false;
  }

  return true;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  if (!validateJsonRequest(req, res)) {
    return;
  }

  try {
    const { tool, args } = req.body ?? {};
    const { method, payload } = buildBitrixRequest(tool, args);
    const bitrixResponse = await postToBitrix(method, payload);
    const result = bitrixResponse?.result ?? bitrixResponse;
    return res.status(200).json({ result });
  } catch (error) {
    const statusCode = error?.statusCode || (error instanceof BadRequestError ? 400 : 500);
    const message = error?.message || 'Unknown error';
    return res.status(statusCode).json({ error: { message } });
  }
}
