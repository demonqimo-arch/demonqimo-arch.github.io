import { addYears, endOfMonth, format, parseISO, setMonth, startOfMonth, startOfYear } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelectedDate } from '../hooks/useSelectedDate'
import { useTasksInRange } from '../hooks/useTasks'

const ACCENT_RGB = '91 79 232'

export function YearView() {
  const { dateIso, setDateIso } = useSelectedDate()
  const navigate = useNavigate()
  const selected = parseISO(dateIso)
  const yearStart = startOfYear(selected)

  const rangeStart = format(yearStart, 'yyyy-MM-dd')
  const rangeEnd = format(endOfMonth(setMonth(yearStart, 11)), 'yyyy-MM-dd')
  const tasks = useTasksInRange(rangeStart, rangeEnd)

  const months = Array.from({ length: 12 }, (_, i) => startOfMonth(setMonth(yearStart, i)))

  const shiftYear = (delta: number) => setDateIso(format(addYears(yearStart, delta), 'yyyy-MM-dd'))

  const goToMonth = (month: Date) => {
    const iso = format(month, 'yyyy-MM-dd')
    setDateIso(iso)
    navigate(`/month?date=${iso}`)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => shiftYear(-1)}
          className="rounded-full bg-surface p-2 text-ink-muted shadow-card active:scale-95"
          aria-label="上一年"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-semibold tracking-tight">{format(yearStart, 'yyyy年')}</h1>
        <button
          onClick={() => shiftYear(1)}
          className="rounded-full bg-surface p-2 text-ink-muted shadow-card active:scale-95"
          aria-label="下一年"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {months.map((month) => {
          const monthStart = format(month, 'yyyy-MM-dd')
          const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd')
          const monthTasks = tasks.filter((t) => t.dueDate != null && t.dueDate >= monthStart && t.dueDate <= monthEnd)
          const total = monthTasks.length
          const done = monthTasks.filter((t) => t.isDone).length
          const ratio = total > 0 ? done / total : 0
          const alpha = total > 0 ? 0.25 + 0.6 * ratio : 0.08
          const strong = total > 0 && ratio >= 0.5

          return (
            <button
              key={monthStart}
              onClick={() => goToMonth(month)}
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-4"
              style={{ backgroundColor: `rgb(${ACCENT_RGB} / ${alpha})` }}
            >
              <span className={`text-sm font-semibold ${strong ? 'text-white' : 'text-ink'}`}>
                {format(month, 'M月')}
              </span>
              {total > 0 && (
                <span className={`text-[11px] tabular-nums ${strong ? 'text-white/80' : 'text-ink-muted'}`}>
                  {done}/{total}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
