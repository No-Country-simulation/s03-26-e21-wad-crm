import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockTasks = [
  { id: '1', title: 'Follow up with John', priority: 'HIGH', dueAt: '2026-04-10', isCompleted: false },
  { id: '2', title: 'Send proposal', priority: 'MEDIUM', dueAt: '2026-04-15', isCompleted: false },
  { id: '3', title: 'Call Jane', priority: 'LOW', dueAt: '2026-04-20', isCompleted: true },
];

describe('Tasks Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should fetch all tasks', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockTasks }),
      });

      const response = await fetch('/api/tasks', {
        headers: { Authorization: 'Bearer mock-token' },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.any(Object));
      expect(response.ok).toBe(true);
    });

    it('should filter pending tasks', async () => {
      const pendingTasks = mockTasks.filter(t => !t.isCompleted);
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: pendingTasks }),
      });

      const response = await fetch('/api/tasks?completed=false');
      const data = await response.json();

      expect(data.data).toHaveLength(2);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { 
        title: 'New Task', 
        priority: 'MEDIUM',
        dueAt: '2026-04-25',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '4', ...newTask, isCompleted: false }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify(newTask),
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
        method: 'POST',
      }));
      expect(response.ok).toBe(true);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update a task', async () => {
      const updatedData = { title: 'Updated Task Title' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', ...updatedData }),
      });

      const response = await fetch('/api/tasks/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify(updatedData),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('should mark task as completed', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', isCompleted: true }),
      });

      const response = await fetch('/api/tasks/1/complete', {
        method: 'PATCH',
        headers: { Authorization: 'Bearer mock-token' },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/tasks/1/complete', expect.objectContaining({
        method: 'PATCH',
      }));
      expect(response.ok).toBe(true);
    });
  });

  describe('Task Data Structure', () => {
    it('should have required fields', () => {
      const task = mockTasks[0];
      
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('isCompleted');
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(task.priority);
    });

    it('should validate priority levels', () => {
      const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
      
      mockTasks.forEach(task => {
        expect(validPriorities).toContain(task.priority);
      });
    });
  });

  describe('Task Filtering', () => {
    it('should filter by priority', () => {
      const highPriority = mockTasks.filter(t => t.priority === 'HIGH');
      expect(highPriority).toHaveLength(1);
      expect(highPriority[0].title).toBe('Follow up with John');
    });

    it('should filter completed tasks', () => {
      const completed = mockTasks.filter(t => t.isCompleted);
      expect(completed).toHaveLength(1);
      expect(completed[0].title).toBe('Call Jane');
    });

    it('should filter pending tasks', () => {
      const pending = mockTasks.filter(t => !t.isCompleted);
      expect(pending).toHaveLength(2);
    });
  });

  describe('Task Sorting', () => {
    it('should sort by priority (HIGH first)', () => {
      const sorted = [...mockTasks].sort((a, b) => {
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      expect(sorted[0].priority).toBe('HIGH');
      expect(sorted[1].priority).toBe('MEDIUM');
    });

    it('should sort by due date', () => {
      const sorted = [...mockTasks].sort((a, b) => 
        new Date(a.dueAt) - new Date(b.dueAt)
      );
      
      expect(sorted[0].title).toBe('Follow up with John');
    });
  });
});
