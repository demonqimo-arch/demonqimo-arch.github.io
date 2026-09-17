import type { Task } from '../types/task'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toUtcStamp(date: Date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

function escapeIcsText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

export function canExportToCalendar(task: Task): boolean {
  return !!task.dueDate && task.dueTimeMinutes != null
}

export function buildIcsBlob(task: Task): Blob {
  if (!task.dueDate || task.dueTimeMinutes == null) {
    throw new Error('导出日历需要待办同时有日期和时间')
  }

  const [year, month, day] = task.dueDate.split('-').map(Number)
  const hours = Math.floor(task.dueTimeMinutes / 60)
  const minutes = task.dueTimeMinutes % 60
  const start = new Date(year, month - 1, day, hours, minutes)
  const end = new Date(start.getTime() + 30 * 60 * 1000)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//XingchengApp//CN',
    'BEGIN:VEVENT',
    `UID:${task._id}@xingcheng-app`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(task.title)}`,
    ...(task.note ? [`DESCRIPTION:${escapeIcsText(task.note)}`] : []),
    ...(task.reminderEnabled
      ? [
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          `TRIGGER:-PT${task.reminderLeadMinutes}M`,
          `DESCRIPTION:${escapeIcsText(task.title)}`,
          'END:VALARM',
        ]
      : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
}

export async function exportTaskToCalendar(task: Task) {
  const blob = buildIcsBlob(task)
  const file = new File([blob], `${task.title}.ics`, { type: 'text/calendar' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: task.title })
      return
    } catch {
      // 用户取消分享或分享失败，走下面的下载兜底
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${task.title}.ics`
  link.click()
  URL.revokeObjectURL(url)
}
