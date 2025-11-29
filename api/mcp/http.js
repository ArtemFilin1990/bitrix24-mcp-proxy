export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const setCors = (res) => {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
};

export const methodNotAllowed = (res, allowed) => {
  res.setHeader('Allow', allowed);
  return res
    .status(405)
    .json({ ok: false, message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED', details: null });
};

export const sendError = (res, statusCode, message, code = 'ERROR', details = null) =>
  res.status(statusCode).json({ ok: false, message, code, details });

export const sendOk = (res, data = null) => res.status(200).json({ ok: true, ...(data !== null ? { data } : {}) });
