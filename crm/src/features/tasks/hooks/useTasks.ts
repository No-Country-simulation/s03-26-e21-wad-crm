import { useEffect, useState } from 'react'
import { useTasksStore } from '../store'
import type { TaskFilter } from '../types'

export function useTasks() {
  const { tasks, isLoading, fetchTasks, toggleTaskComplete } = useTasksStore()
  const [filter, setFilter] = useState<TaskFilter>('all')

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const isOverdue = (dueAt?: string, completed?: boolean) => {
    if (!dueAt || completed) return false
    return new Date(dueAt) < new Date()
  }

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  return {
    tasks: filteredTasks,
    isLoading,
    filter,
    setFilter,
    toggleTaskComplete,
    formatDate,
    isOverdue,
    pendingCount,
    completedCount,
  }
}
