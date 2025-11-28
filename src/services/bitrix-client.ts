import fetch from 'node-fetch';

interface BitrixConfig {
  webhookUrl: string;
}

export class BitrixClient {
  private config: BitrixConfig;

  constructor(config: BitrixConfig) {
    this.config = config;
  }

  private async callMethod(method: string, params: Record<string, any> = {}) {
    const url = `${this.config.webhookUrl}/${method}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Bitrix API Error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (data.error) {
        throw new Error(`Bitrix Logic Error: ${data.error_description || data.error}`);
      }
      return data;
    } catch (error) {
      console.error(`Failed to call ${method}`, error);
      throw error;
    }
  }

  async getDeal(id: number) {
    return this.callMethod('crm.deal.get', { id });
  }

  async getContact(id: number) {
    return this.callMethod('crm.contact.get', { id });
  }

  async addDeal(fields: Record<string, any>) {
    return this.callMethod('crm.deal.add', { fields });
  }
}
