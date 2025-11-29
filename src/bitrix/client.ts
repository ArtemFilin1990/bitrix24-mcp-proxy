import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env.js';

/**
 * Simple rate limiter for Bitrix24 API (2 requests per second)
 */
class RateLimiter {
  private lastRequestTime = 0;
  private readonly minInterval: number;

  constructor(requestsPerSecond: number = 2) {
    // Calculate minimum interval in milliseconds between requests
    this.minInterval = 1000 / requestsPerSecond;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }
}

// Create a rate limiter instance (2 requests per second as per Bitrix24 API limits)
const rateLimiter = new RateLimiter(2);

// Create axios instance with rate limiting
const createBitrixClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.bitrixUrl,
    timeout: 8000,
    proxy: false,
  });

  // Add rate limiting interceptor
  instance.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
      await rateLimiter.waitForSlot();
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

export const bitrix = createBitrixClient();
