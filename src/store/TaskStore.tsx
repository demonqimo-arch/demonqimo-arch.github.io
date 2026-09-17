import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { fetchTasks, insertTask, updateTaskRow } from '../lib/tasksApi'
import type { Task } from '../types/task'

interface TaskStoreValue {
  tasks: Task[]
  tags: string[]
  isLoading: boolean
  toggleDone: (id: string) => void
  addTask: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, changes: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => void
}

const TaskStoreContext = createContext<TaskStoreValue | null>(null)

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks })
  const tasks = useMemo(() => data ?? [], [data])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] })

  const addMutation = useMutation({ mutationFn: insertTask, onSuccess: invalidate })
  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Omit<Task, '_id' | 'createdAt' | 'updatedAt'> }) =>
      updateTaskRow(id, changes),
    onSuccess: invalidate,
  })

  const value = useMemo<TaskStoreValue>(
    () => ({
      tasks,
      tags: Array.from(new Set(tasks.map((t) => t.tag).filter((tag): tag is string => !!tag))),
      isLoading,
      toggleDone: (id) => {
        const task = tasks.find((t) => t._id === id)
        if (!task) return
        const { _id, createdAt, updatedAt, ...rest } = task
        updateMutation.mutate({ id, changes: { ...rest, isDone: !task.isDone } })
      },
      addTask: (task) => addMutation.mutate(task),
      updateTask: (id, changes) => updateMutation.mutate({ id, changes }),
    }),
    [tasks, isLoading, addMutation, updateMutation],
  )

  return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>
}

export function useTaskStore() {
  const ctx = useContext(TaskStoreContext)
  if (!ctx) throw new Error('useTaskStore 必须在 TaskStoreProvider 内使用')
  return ctx
}
