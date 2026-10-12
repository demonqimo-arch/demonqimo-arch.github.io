import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { fetchTasksFromGithub, saveTasksToGithub, type TasksPayload } from '../lib/githubApi'
import type { Task } from '../types/task'

interface TaskStoreValue {
  tasks: Task[]
  tags: string[]
  isLoading: boolean
  loadError: boolean
  saveError: boolean
  retryLoad: () => void
  retrySave: () => void
  toggleDone: (id: string) => void
  addTask: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, changes: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => void
  deleteTask: (id: string) => void
}

const TaskStoreContext = createContext<TaskStoreValue | null>(null)

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError: loadError, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasksFromGithub,
    retry: 1,
  })
  const tasks = useMemo(() => data?.tasks ?? [], [data])
  const sha = data?.sha ?? null

  const saveMutation = useMutation({
    mutationFn: (nextTasks: Task[]) => saveTasksToGithub(nextTasks, sha),
    onSuccess: (newSha, nextTasks) => {
      queryClient.setQueryData<TasksPayload>(['tasks'], { tasks: nextTasks, sha: newSha })
    },
  })

  const now = () => new Date().toISOString()

  const value = useMemo<TaskStoreValue>(
    () => ({
      tasks,
      tags: Array.from(new Set(tasks.map((t) => t.tag).filter((tag): tag is string => !!tag))),
      isLoading,
      loadError,
      saveError: saveMutation.isError,
      retryLoad: () => refetch(),
      retrySave: () => {
        if (saveMutation.variables) saveMutation.mutate(saveMutation.variables)
      },
      toggleDone: (id) => {
        const next = tasks.map((t) => (t._id === id ? { ...t, isDone: !t.isDone, updatedAt: now() } : t))
        saveMutation.mutate(next)
      },
      addTask: (task) => {
        const newTask: Task = { ...task, _id: crypto.randomUUID(), createdAt: now(), updatedAt: now() }
        saveMutation.mutate([...tasks, newTask])
      },
      updateTask: (id, changes) => {
        const next = tasks.map((t) => (t._id === id ? { ...t, ...changes, updatedAt: now() } : t))
        saveMutation.mutate(next)
      },
      deleteTask: (id) => {
        const next = tasks.filter((t) => t._id !== id)
        saveMutation.mutate(next)
      },
    }),
    [tasks, isLoading, loadError, saveMutation, refetch],
  )

  return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>
}

export function useTaskStore() {
  const ctx = useContext(TaskStoreContext)
  if (!ctx) throw new Error('useTaskStore 必须在 TaskStoreProvider 内使用')
  return ctx
}
