import { httpClient, HttpClientError, sendWithRetry } from '../core/httpClient.js';

export class BitrixClientError extends HttpClientError {}

export const bitrix = httpClient;

export const postWithRetry = async <T>(url: string, payload: unknown): Promise<T> =>
  sendWithRetry<T>({
    url,
    method: 'POST',
    data: payload,
  });
