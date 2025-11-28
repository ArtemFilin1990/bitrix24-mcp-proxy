import { bitrix } from '../bitrix/client.js';

export const getDeal = {
  name: 'bitrix_get_deal',
  description: 'Получить сделку по ID',
  parameters: {
    id: { type: 'number', required: true }
  },
  handler: async ({ id }: { id: number }) => {
    const response = await bitrix.get('/crm.deal.get', {
      params: { id }
    });
    return response.data;
  }
};
