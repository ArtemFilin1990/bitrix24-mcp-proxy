import { bitrix } from '../bitrix/client.js';

export const createDeal = {
  name: 'bitrix_create_deal',
  description: 'Создать сделку в Bitrix24',
  parameters: {
    title: { type: 'string', required: true }
  },
  handler: async ({ title }: { title: string }) => {
    const response = await bitrix.post('/crm.deal.add', {
      fields: { TITLE: title }
    });
    return response.data;
  }
};
