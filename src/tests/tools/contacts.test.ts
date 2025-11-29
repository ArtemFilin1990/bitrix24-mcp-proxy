import { buildContactRequest, contactTools } from '../../mcp/tools/contacts.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Contact Tools', () => {
  describe('Tool definitions', () => {
    test('contactTools has 7 tools', () => {
      expect(contactTools.length).toBe(7);
    });
  });

  describe('buildContactRequest', () => {
    test('bitrix_contact_list builds correct payload with defaults', () => {
      const result = buildContactRequest('bitrix_contact_list', {});
      expect(result).toEqual({
        method: 'crm.contact.list',
        payload: { filter: {}, select: ['*'], order: {}, start: 0 },
      });
    });

    test('bitrix_contact_get builds correct payload', () => {
      const result = buildContactRequest('bitrix_contact_get', { id: 123 });
      expect(result).toEqual({ method: 'crm.contact.get', payload: { id: 123 } });
    });

    test('bitrix_contact_add builds correct payload', () => {
      const result = buildContactRequest('bitrix_contact_add', {
        fields: { NAME: 'John', LAST_NAME: 'Doe' },
      });
      expect(result).toEqual({
        method: 'crm.contact.add',
        payload: { fields: { NAME: 'John', LAST_NAME: 'Doe' } },
      });
    });

    test('bitrix_contact_add throws without fields', () => {
      expect(() => buildContactRequest('bitrix_contact_add', {})).toThrow(BadRequestError);
    });

    test('bitrix_contact_update builds correct payload', () => {
      const result = buildContactRequest('bitrix_contact_update', {
        id: 55,
        fields: { NAME: 'Jane' },
      });
      expect(result).toEqual({
        method: 'crm.contact.update',
        payload: { id: 55, fields: { NAME: 'Jane' } },
      });
    });

    test('bitrix_contact_delete builds correct payload', () => {
      const result = buildContactRequest('bitrix_contact_delete', { id: 42 });
      expect(result).toEqual({ method: 'crm.contact.delete', payload: { id: 42 } });
    });

    test('bitrix_contact_fields builds correct payload', () => {
      const result = buildContactRequest('bitrix_contact_fields', {});
      expect(result).toEqual({ method: 'crm.contact.fields', payload: {} });
    });

    test('bitrix_contact_search_by_phone builds correct payload', () => {
      const result = buildContactRequest('bitrix_contact_search_by_phone', { phone: '+79001234567' });
      expect(result).toEqual({
        method: 'crm.duplicate.findbycomm',
        payload: { type: 'PHONE', values: ['+79001234567'], entity_type: 'CONTACT' },
      });
    });

    test('bitrix_contact_search_by_phone throws without phone', () => {
      expect(() => buildContactRequest('bitrix_contact_search_by_phone', {})).toThrow(BadRequestError);
    });

    test('returns null for unknown tool', () => {
      const result = buildContactRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
