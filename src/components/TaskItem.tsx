import { CalendarPlus } from 'lucide-react'
import taskDoneIcon from '../assets/feirenzai/task-done.png'
import { canExportToCalendar, exportTaskToCalendar } from '../lib/ics'
import type { Task } from '../types/task'

interface Props {
  task: Task
  onToggle: (id: string) => void
  dateLabel?: string
  onEdit?: (task: Task) => void
}

function TaskContent({ task, dateLabel }: { task: Task; dateLabel?: string }) {
  return (
    <>
      {(dateLabel || task.tag) && (
        <div className="flex items-center gap-1.5">
          {dateLabel && <p className="truncate text-[11px] text-ink-muted">{dateLabel}</p>}
          {task.tag && (
            <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
              {task.tag}
            </span>
          )}
        </div>
      )}
      <p className={`truncate text-sm font-medium ${task.isDone ? 'text-done line-through' : 'text-ink'}`}>
        {task.title}
      </p>
      {task.note && <p className="mt-0.5 truncate text-xs text-ink-muted">{task.note}</p>}
    </>
  )
}

export function TaskItem({ task, onToggle, dateLabel, onEdit }: Props) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card">
      <button
        onClick={() => onToggle(task._id)}
        aria-label={task.isDone ? '标记为未完成' : '标记为已完成'}
        className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-colors ${
          task.isDone ? 'border-accent' : 'border-line'
        }`}
      >
        {task.isDone && <img src={taskDoneIcon} alt="" className="h-full w-full object-cover" />}
      </button>
      {onEdit ? (
        <button onClick={() => onEdit(task)} className="min-w-0 flex-1 text-left">
          <TaskContent task={task} dateLabel={dateLabel} />
        </button>
      ) : (
        <div className="min-w-0 flex-1">
          <TaskContent task={task} dateLabel={dateLabel} />
        </div>
      )}
      {canExportToCalendar(task) && (
        <button
          onClick={() => exportTaskToCalendar(task)}
          aria-label="添加到系统日历"
          className="shrink-0 rounded-full p-1.5 text-ink-muted active:scale-95"
        >
          <CalendarPlus size={18} />
        </button>
      )}
    </li>
  )
}
