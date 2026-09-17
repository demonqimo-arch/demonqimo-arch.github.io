import { useMemo } from 'react'
import { useTaskStore } from '../store/TaskStore'

export function useTasksInRange(startIso: string, endIso: string) {
  const { tasks } = useTaskStore()
  return useMemo(
    () => tasks.filter((t) => t.dueDate != null && t.dueDate >= startIso && t.dueDate <= endIso),
    [tasks, startIso, endIso],
  )
}

export function useTasksOnDate(dateIso: string) {
  return useTasksInRange(dateIso, dateIso)
}
