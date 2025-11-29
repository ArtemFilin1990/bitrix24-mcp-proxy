import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../config/env.js';

export interface HttpErrorPayload {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export class HttpClientError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, payload: HttpErrorPayload = {}) {
    super(message);
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.details = payload.details;
  }
}

const MAX_RETRIES = Math.max(config.bitrixRetryCount, 1);

const isRetryable = (error: AxiosError): boolean => {
  const status = error.response?.status;
  return (
    error.code === 'ECONNABORTED' ||
    status === 429 ||
    (typeof status === 'number' && status >= 500) ||
    status === undefined
  );
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeError = (error: AxiosError): HttpClientError => {
  const status = error.response?.status;
  const message =
    (error.response?.data as { error_description?: string; error?: string })?.error_description ||
    (error.response?.data as { error?: string })?.error ||
    error.message;

  return new HttpClientError(message, {
    statusCode: status,
    code: error.code,
    details: error.response?.data,
  });
};

export const httpClient: AxiosInstance = axios.create({
  baseURL: config.bitrixUrl,
  timeout: config.bitrixTimeoutMs,
  proxy: false,
});

export const sendWithRetry = async <T>(request: AxiosRequestConfig): Promise<T> => {
  let attempt = 0;
  let lastError: AxiosError | undefined;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await httpClient.request<T>({
        validateStatus: () => true,
        ...request,
      });

      if (response.status && response.status >= 200 && response.status < 300) {
        return response.data;
      }

      const axiosError = new AxiosError('Request failed');
      axiosError.config = request as unknown as AxiosError['config'];
      axiosError.response = response as unknown as AxiosError['response'];

      throw axiosError;
    } catch (error) {
      const axiosError = error as AxiosError;
      lastError = axiosError;
      attempt += 1;
      const shouldRetry = isRetryable(axiosError) && attempt < MAX_RETRIES;

      console.error(
        `[HTTP client] request failed (attempt ${attempt}/${MAX_RETRIES})`,
        axiosError.message,
        axiosError.response?.status
      );

      if (!shouldRetry) {
        throw normalizeError(axiosError);
      }

      await delay(config.bitrixRetryDelayMs * attempt);
    }
  }

  throw normalizeError(lastError as AxiosError);
};
