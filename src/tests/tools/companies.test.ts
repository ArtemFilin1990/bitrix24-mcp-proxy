import { buildCompanyRequest, companyTools } from '../../mcp/tools/companies.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Company Tools', () => {
  describe('Tool definitions', () => {
    test('companyTools has 6 tools', () => {
      expect(companyTools.length).toBe(6);
    });
  });

  describe('buildCompanyRequest', () => {
    test('bitrix_company_list builds correct payload with defaults', () => {
      const result = buildCompanyRequest('bitrix_company_list', {});
      expect(result).toEqual({
        method: 'crm.company.list',
        payload: { filter: {}, select: ['*'], order: {}, start: 0 },
      });
    });

    test('bitrix_company_get builds correct payload', () => {
      const result = buildCompanyRequest('bitrix_company_get', { id: 123 });
      expect(result).toEqual({ method: 'crm.company.get', payload: { id: 123 } });
    });

    test('bitrix_company_add builds correct payload', () => {
      const result = buildCompanyRequest('bitrix_company_add', {
        fields: { TITLE: 'Acme Inc' },
      });
      expect(result).toEqual({
        method: 'crm.company.add',
        payload: { fields: { TITLE: 'Acme Inc' } },
      });
    });

    test('bitrix_company_add throws without TITLE', () => {
      expect(() => buildCompanyRequest('bitrix_company_add', { fields: {} })).toThrow(BadRequestError);
    });

    test('bitrix_company_update builds correct payload', () => {
      const result = buildCompanyRequest('bitrix_company_update', {
        id: 55,
        fields: { TITLE: 'Acme Corp' },
      });
      expect(result).toEqual({
        method: 'crm.company.update',
        payload: { id: 55, fields: { TITLE: 'Acme Corp' } },
      });
    });

    test('bitrix_company_delete builds correct payload', () => {
      const result = buildCompanyRequest('bitrix_company_delete', { id: 42 });
      expect(result).toEqual({ method: 'crm.company.delete', payload: { id: 42 } });
    });

    test('bitrix_company_fields builds correct payload', () => {
      const result = buildCompanyRequest('bitrix_company_fields', {});
      expect(result).toEqual({ method: 'crm.company.fields', payload: {} });
    });

    test('returns null for unknown tool', () => {
      const result = buildCompanyRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
