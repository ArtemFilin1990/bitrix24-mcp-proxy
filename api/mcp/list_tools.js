import { toolNames } from './tools.js';

const respondWithError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ error: { message, code } });
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return respondWithError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  return res.status(200).json({ tools: toolNames });
}
