import { buildTaskRequest, taskTools } from '../../mcp/tools/tasks.js';
import { BadRequestError } from '../../mcp/validation.js';

describe('Task Tools', () => {
  describe('Tool definitions', () => {
    test('taskTools has 5 tools', () => {
      expect(taskTools.length).toBe(5);
    });
  });

  describe('buildTaskRequest', () => {
    test('bitrix_task_list builds correct payload with defaults', () => {
      const result = buildTaskRequest('bitrix_task_list', {});
      expect(result).toEqual({
        method: 'tasks.task.list',
        payload: { filter: {}, select: ['*'], order: {}, start: 0 },
      });
    });

    test('bitrix_task_get builds correct payload', () => {
      const result = buildTaskRequest('bitrix_task_get', { taskId: 123 });
      expect(result).toEqual({ method: 'tasks.task.get', payload: { taskId: 123 } });
    });

    test('bitrix_task_add builds correct payload', () => {
      const result = buildTaskRequest('bitrix_task_add', {
        fields: { TITLE: 'New Task', RESPONSIBLE_ID: 1 },
      });
      expect(result).toEqual({
        method: 'tasks.task.add',
        payload: { fields: { TITLE: 'New Task', RESPONSIBLE_ID: 1 } },
      });
    });

    test('bitrix_task_add throws without TITLE or RESPONSIBLE_ID', () => {
      expect(() => buildTaskRequest('bitrix_task_add', {
        fields: { TITLE: 'Task' },
      })).toThrow(BadRequestError);
    });

    test('bitrix_task_update builds correct payload', () => {
      const result = buildTaskRequest('bitrix_task_update', {
        taskId: 55,
        fields: { TITLE: 'Updated Task' },
      });
      expect(result).toEqual({
        method: 'tasks.task.update',
        payload: { taskId: 55, fields: { TITLE: 'Updated Task' } },
      });
    });

    test('bitrix_task_close builds correct payload', () => {
      const result = buildTaskRequest('bitrix_task_close', { taskId: 42 });
      expect(result).toEqual({ method: 'tasks.task.complete', payload: { taskId: 42 } });
    });

    test('returns null for unknown tool', () => {
      const result = buildTaskRequest('unknown_tool', {});
      expect(result).toBeNull();
    });
  });
});
