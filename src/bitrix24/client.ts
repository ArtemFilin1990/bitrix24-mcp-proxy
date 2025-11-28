import { createLogger } from '../utils/logger.js';

const logger = createLogger('Bitrix24Client');

/**
 * Bitrix24 client configuration
 */
export interface Bitrix24ClientConfig {
  /** Webhook URL for direct API access */
  webhookUrl?: string;
  /** OAuth Client ID */
  clientId?: string;
  /** OAuth Client Secret */
  clientSecret?: string;
}

/**
 * Bitrix24 API response
 */
export interface Bitrix24Response<T = unknown> {
  result?: T;
  error?: string;
  error_description?: string;
}

/**
 * Bitrix24 REST API client
 */
export class Bitrix24Client {
  private webhookUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor(config: Bitrix24ClientConfig) {
    this.webhookUrl = config.webhookUrl || '';
    this.clientId = config.clientId || '';
    this.clientSecret = config.clientSecret || '';

    logger.debug('Bitrix24Client initialized');
  }

  /**
   * Call a Bitrix24 REST API method
   */
  async call<T = unknown>(
    method: string,
    params: Record<string, unknown> = {}
  ): Promise<Bitrix24Response<T>> {
    if (!this.webhookUrl) {
      throw new Error('Webhook URL is not configured');
    }

    const url = `${this.webhookUrl}${method}.json`;

    logger.debug({ method, url }, 'Calling Bitrix24 API');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as Bitrix24Response<T>;

    if (data.error) {
      logger.error(
        { error: data.error, description: data.error_description },
        'Bitrix24 API error'
      );
      throw new Error(`Bitrix24 API error: ${data.error} - ${data.error_description}`);
    }

    logger.debug({ method, result: !!data.result }, 'Bitrix24 API call successful');

    return data;
  }

  /**
   * Check if the client is configured
   */
  isConfigured(): boolean {
    return !!this.webhookUrl || (!!this.clientId && !!this.clientSecret);
  }
}
