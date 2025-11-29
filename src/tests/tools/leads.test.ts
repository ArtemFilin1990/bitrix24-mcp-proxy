import { buildLeadRequest, leadTools } from '../../mcp/tools/leads.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Lead Tools', () => {
  describe('Tool definitions', () => {
    test('leadTools has 8 tools', () => {
      expect(leadTools.length).toBe(8);
    });
  });

  describe('buildLeadRequest', () => {
    test('bitrix_lead_list builds correct payload with defaults', () => {
      const result = buildLeadRequest('bitrix_lead_list', {});
      expect(result).toEqual({
        method: 'crm.lead.list',
        payload: { filter: {}, select: ['*'], order: {}, start: 0 },
      });
    });

    test('bitrix_lead_get builds correct payload', () => {
      const result = buildLeadRequest('bitrix_lead_get', { id: 123 });
      expect(result).toEqual({ method: 'crm.lead.get', payload: { id: 123 } });
    });

    test('bitrix_lead_add builds correct payload', () => {
      const result = buildLeadRequest('bitrix_lead_add', {
        fields: { TITLE: 'New Lead' },
      });
      expect(result).toEqual({
        method: 'crm.lead.add',
        payload: { fields: { TITLE: 'New Lead' } },
      });
    });

    test('bitrix_lead_add throws without TITLE', () => {
      expect(() => buildLeadRequest('bitrix_lead_add', { fields: {} })).toThrow(BadRequestError);
    });

    test('bitrix_lead_update builds correct payload', () => {
      const result = buildLeadRequest('bitrix_lead_update', {
        id: 55,
        fields: { STATUS_ID: 'CONVERTED' },
      });
      expect(result).toEqual({
        method: 'crm.lead.update',
        payload: { id: 55, fields: { STATUS_ID: 'CONVERTED' } },
      });
    });

    test('bitrix_lead_delete builds correct payload', () => {
      const result = buildLeadRequest('bitrix_lead_delete', { id: 42 });
      expect(result).toEqual({ method: 'crm.lead.delete', payload: { id: 42 } });
    });

    test('bitrix_lead_fields builds correct payload', () => {
      const result = buildLeadRequest('bitrix_lead_fields', {});
      expect(result).toEqual({ method: 'crm.lead.fields', payload: {} });
    });

    test('bitrix_lead_convert builds correct payload with all flags', () => {
      const result = buildLeadRequest('bitrix_lead_convert', {
        id: 123,
        createDeal: true,
        createContact: true,
        createCompany: false,
      });
      expect(result).toEqual({
        method: 'crm.lead.convert',
        payload: {
          id: 123,
          params: {
            CREATE_DEAL: 'Y',
            CREATE_CONTACT: 'Y',
            CREATE_COMPANY: 'N',
          },
        },
      });
    });

    test('bitrix_lead_convert defaults to all N', () => {
      const result = buildLeadRequest('bitrix_lead_convert', { id: 123 });
      expect(result).toEqual({
        method: 'crm.lead.convert',
        payload: {
          id: 123,
          params: {
            CREATE_DEAL: 'N',
            CREATE_CONTACT: 'N',
            CREATE_COMPANY: 'N',
          },
        },
      });
    });

    test('bitrix_lead_userfield_list builds correct payload', () => {
      const result = buildLeadRequest('bitrix_lead_userfield_list', {});
      expect(result).toEqual({ method: 'crm.lead.userfield.list', payload: {} });
    });

    test('returns null for unknown tool', () => {
      const result = buildLeadRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
