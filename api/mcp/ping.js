import { corsHeaders, methodNotAllowed, sendOk, setCors } from './http.js';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  setCors(res);

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET', 'OPTIONS']);
  }

  return sendOk(res);
}
