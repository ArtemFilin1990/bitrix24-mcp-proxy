/**
 * Bitrix24 API Client
 * Provides a basic interface for interacting with the Bitrix24 REST API.
 */

import fetch from 'node-fetch';

export interface BitrixRequestParams {
  [key: string]: unknown;
}

export interface BitrixResponse<T = unknown> {
  result: T;
  total?: number;
  next?: number;
}

export interface BitrixClientConfig {
  webhookUrl: string;
}

export class BitrixClient {
  private readonly webhookUrl: string;

  constructor(config: BitrixClientConfig) {
    this.webhookUrl = config.webhookUrl.endsWith('/')
      ? config.webhookUrl
      : `${config.webhookUrl}/`;
  }

  /**
   * Calls a Bitrix24 REST API method.
   * @param method - The API method name (e.g., 'crm.deal.list')
   * @param params - Optional parameters for the API call
   * @returns The API response
   */
  async call<T = unknown>(
    method: string,
    params?: BitrixRequestParams
  ): Promise<BitrixResponse<T>> {
    const url = `${this.webhookUrl}${method}.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(params ?? {}),
    });

    if (!response.ok) {
      throw new Error(
        `Bitrix24 API error: ${response.status} ${response.statusText} for ${method} at ${url}`
      );
    }

    const data = await response.json();
    return data as BitrixResponse<T>;
  }

  /**
   * Gets the configured webhook URL.
   * @returns The webhook URL
   */
  getWebhookUrl(): string {
    return this.webhookUrl;
  }
}
