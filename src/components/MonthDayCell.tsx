import type { HolidayBadge } from '../lib/holidays'
import type { Task } from '../types/task'

const PREVIEW_LIMIT = 2

interface Props {
  dayLabel: string
  tasks: Task[]
  inMonth: boolean
  isToday?: boolean
  isWeekend?: boolean
  holiday?: HolidayBadge | null
  onClick: () => void
}

export function MonthDayCell({ dayLabel, tasks, inMonth, isToday, isWeekend, holiday, onClick }: Props) {
  const preview = tasks.slice(0, PREVIEW_LIMIT)
  const remaining = tasks.length - preview.length

  // 有节假日数据时以数据为准（调休上班日虽是周末但要显示为正常工作日），没有数据时按普通周末处理
  const isRestDay = holiday ? holiday.isOffDay : isWeekend

  const numberColor = isToday
    ? 'bg-accent text-white'
    : !inMonth
      ? 'text-ink-muted'
      : isRestDay
        ? 'text-rose-500'
        : 'text-ink'

  return (
    <button
      onClick={onClick}
      className={`flex min-h-20 flex-col items-start gap-0.5 border-b border-r border-line p-1.5 text-left ${
        inMonth ? 'bg-surface' : 'bg-canvas/60'
      }`}
    >
      <div className="flex min-w-0 items-center gap-1">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${numberColor}`}
        >
          {dayLabel}
        </span>
        {inMonth && holiday && (
          <span className={`truncate text-[9px] leading-none ${holiday.isOffDay ? 'text-rose-500' : 'text-ink-muted'}`}>
            {holiday.label}
          </span>
        )}
      </div>

      <div className="flex w-full flex-col gap-0.5">
        {preview.map((task) => (
          <span
            key={task._id}
            className={`w-full truncate rounded px-1 text-[10px] leading-tight ${
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
