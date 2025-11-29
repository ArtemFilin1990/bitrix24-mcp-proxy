import { buildBitrixRequest } from './tools.js';
import { postToBitrix } from './bitrix.js';
import { BadRequestError } from './errors.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tool, args } = req.body ?? {};
    const { method, payload } = buildBitrixRequest(tool, args);
    const result = await postToBitrix(method, payload);
    return res.status(200).json({ result });
  } catch (error) {
    const statusCode = error?.statusCode || (error instanceof BadRequestError ? 400 : 500);
    const message = error?.message || 'Unknown error';
    return res.status(statusCode).json({ error: message });
  }
}
