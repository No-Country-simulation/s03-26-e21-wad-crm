import { create } from 'zustand'
import { tasksApi, type Task } from '@/api/endpoints/tasks'

interface TasksState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  selectedTask: Task | null
  
  fetchTasks: () => Promise<void>
  getTaskById: (id: string) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskComplete: (id: string) => Promise<void>
  setSelectedTask: (task: Task | null) => void
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  selectedTask: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const tasks = await tasksApi.getAll()
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  getTaskById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const task = await tasksApi.getById(id)
      set({ selectedTask: task, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createTask: async (task) => {
    set({ isLoading: true, error: null })
    try {
      const newTask = await tasksApi.create(task)
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateTask: async (id, task) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTask = await tasksApi.update(id, task)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await tasksApi.delete(id)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  toggleTaskComplete: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTask = await tasksApi.toggleComplete(id)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setSelectedTask: (task) => set({ selectedTask: task }),
}))
