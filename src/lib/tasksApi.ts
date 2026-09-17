import { supabase } from './supabase'
import type { Task } from '../types/task'

interface TaskRow {
  id: string
  title: string
  note: string | null
  tag: string | null
  due_date: string | null
  due_time_minutes: number | null
  is_done: boolean
  reminder_enabled: boolean
  reminder_lead_minutes: 0 | 10 | 30 | 60
  created_at: string
  updated_at: string
}

function rowToTask(row: TaskRow): Task {
  return {
    _id: row.id,
    title: row.title,
    note: row.note,
    tag: row.tag,
    dueDate: row.due_date,
    dueTimeMinutes: row.due_time_minutes,
    isDone: row.is_done,
    reminderEnabled: row.reminder_enabled,
    reminderLeadMinutes: row.reminder_lead_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function taskToRow(task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) {
  return {
    title: task.title,
    note: task.note,
    tag: task.tag,
    due_date: task.dueDate,
    due_time_minutes: task.dueTimeMinutes,
    is_done: task.isDone,
    reminder_enabled: task.reminderEnabled,
    reminder_lead_minutes: task.reminderLeadMinutes,
  }
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data as TaskRow[]).map(rowToTask)
}

export async function insertTask(task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(taskToRow(task)).select().single()
  if (error) throw error
  return rowToTask(data as TaskRow)
}

export async function updateTaskRow(id: string, changes: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...taskToRow(changes), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToTask(data as TaskRow)
}
