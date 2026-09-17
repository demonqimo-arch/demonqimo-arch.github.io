export interface ReminderLeadOption {
  label: string
  minutes: 0 | 10 | 30 | 60
}

export const REMINDER_LEAD_OPTIONS: ReminderLeadOption[] = [
  { label: '准时', minutes: 0 },
  { label: '提前10分钟', minutes: 10 },
  { label: '提前30分钟', minutes: 30 },
  { label: '提前1小时', minutes: 60 },
]

export interface Task {
  _id: string
  title: string
  note: string | null
  tag: string | null
  dueDate: string | null
  dueTimeMinutes: number | null
  isDone: boolean
  reminderEnabled: boolean
  reminderLeadMinutes: 0 | 10 | 30 | 60
  createdAt: string
  updatedAt: string
}
