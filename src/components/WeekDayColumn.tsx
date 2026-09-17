import type { Task } from '../types/task'

const PREVIEW_LIMIT = 4

interface Props {
  weekdayLabel: string
  dayLabel: string
  tasks: Task[]
  isToday?: boolean
  isSelected?: boolean
  onClick: () => void
}

export function WeekDayColumn({ weekdayLabel, dayLabel, tasks, isToday, isSelected, onClick }: Props) {
  const preview = tasks.slice(0, PREVIEW_LIMIT)
  const remaining = tasks.length - preview.length

  return (
    <button
      onClick={onClick}
      className={`flex h-full flex-col items-stretch gap-1.5 rounded-2xl px-1 pb-2 pt-1.5 text-left transition-colors ${
        isSelected ? 'bg-accent-soft ring-1 ring-accent/40' : 'bg-surface shadow-card'
      }`}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] text-ink-muted">{weekdayLabel}</span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
            isToday ? 'bg-accent text-white' : 'text-ink'
          }`}
        >
          {dayLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {preview.map((task) => (
          <span
            key={task._id}
            className={`line-clamp-2 rounded-md px-1 py-0.5 text-left text-[10px] leading-tight ${
              task.isDone ? 'text-done line-through' : 'bg-accent-soft text-accent'
            }`}
          >
            {task.title}
          </span>
        ))}
        {remaining > 0 && <span className="px-1 text-[10px] text-ink-muted">+{remaining}</span>}
      </div>
    </button>
  )
}
