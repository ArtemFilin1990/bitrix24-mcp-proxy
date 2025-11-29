import { buildUserRequest, userTools } from '../../mcp/tools/users.js';

describe('User Tools', () => {
  describe('Tool definitions', () => {
    test('userTools has 4 tools', () => {
      expect(userTools.length).toBe(4);
    });
  });

  describe('buildUserRequest', () => {
    test('bitrix_user_list builds correct payload with defaults', () => {
      const result = buildUserRequest('bitrix_user_list', {});
      expect(result).toEqual({
        method: 'user.get',
        payload: { filter: {}, start: 0 },
      });
    });

    test('bitrix_user_get builds correct payload', () => {
      const result = buildUserRequest('bitrix_user_get', { id: 123 });
      expect(result).toEqual({ method: 'user.get', payload: { ID: 123 } });
    });

    test('bitrix_user_search builds correct payload with search string', () => {
      const result = buildUserRequest('bitrix_user_search', { searchString: 'John' });
      expect(result).toEqual({
        method: 'user.search',
        payload: { filter: {}, start: 0, FIND: 'John' },
      });
    });

    test('bitrix_user_search builds correct payload without search string', () => {
      const result = buildUserRequest('bitrix_user_search', {});
      expect(result).toEqual({
        method: 'user.search',
        payload: { filter: {}, start: 0 },
      });
    });

    test('bitrix_user_current builds correct payload', () => {
      const result = buildUserRequest('bitrix_user_current', {});
      expect(result).toEqual({ method: 'user.current', payload: {} });
    });

    test('returns null for unknown tool', () => {
      const result = buildUserRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
