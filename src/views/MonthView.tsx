import { addDays, addMonths, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MonthDayCell } from '../components/MonthDayCell'
import { useSelectedDate } from '../hooks/useSelectedDate'
import { useTasksInRange } from '../hooks/useTasks'
import { getHolidayBadge } from '../lib/holidays'

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function MonthView() {
  const { dateIso, setDateIso } = useSelectedDate()
  const navigate = useNavigate()
  const selected = parseISO(dateIso)

  const monthStart = startOfMonth(selected)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(selected), { weekStartsOn: 0 })
  const days: Date[] = []
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d)

  const rangeStart = format(days[0], 'yyyy-MM-dd')
  const rangeEnd = format(days[days.length - 1], 'yyyy-MM-dd')
  const tasks = useTasksInRange(rangeStart, rangeEnd)
  const todayIso = format(new Date(), 'yyyy-MM-dd')

  const shiftMonth = (delta: number) => setDateIso(format(addMonths(monthStart, delta), 'yyyy-MM-dd'))
  const goToToday = () => setDateIso(todayIso)

  const goToDay = (iso: string) => {
    setDateIso(iso)
    navigate(`/day?date=${iso}`)
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <div className="flex items-center gap-2">
        <button
          onClick={goToToday}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-card active:scale-95"
        >
          今天
        </button>
        <button
          onClick={() => shiftMonth(-1)}
          className="rounded-full bg-surface p-2 text-ink-muted shadow-card active:scale-95"
          aria-label="上一月"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => shiftMonth(1)}
          className="rounded-full bg-surface p-2 text-ink-muted shadow-card active:scale-95"
          aria-label="下一月"
        >
          <ChevronRight size={18} />
        </button>
        <h1 className="ml-1 text-base font-semibold tracking-tight">{format(monthStart, 'yyyy年MM月')}</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border-l border-t border-line">
        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={`border-b border-r border-line bg-canvas py-1.5 text-center text-[11px] ${
                index === 0 || index === 6 ? 'text-rose-500/70' : 'text-ink-muted'
              }`}
            >
              {label}
            </div>
          ))}
          {days.map((day) => {
            const iso = format(day, 'yyyy-MM-dd')
            const dayTasks = tasks.filter((t) => t.dueDate === iso)
            const weekday = day.getDay()
            return (
              <MonthDayCell
                key={iso}
                dayLabel={format(day, 'd')}
                tasks={dayTasks}
                inMonth={day.getMonth() === monthStart.getMonth()}
                isToday={iso === todayIso}
                isWeekend={weekday === 0 || weekday === 6}
                holiday={getHolidayBadge(iso)}
                onClick={() => goToDay(iso)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
