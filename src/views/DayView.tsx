import { addDays, format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HuangLiCard } from '../components/HuangLiCard'
import { TaskList } from '../components/TaskList'
import { useSelectedDate } from '../hooks/useSelectedDate'
import { useTasksOnDate } from '../hooks/useTasks'
import { useTaskStore } from '../store/TaskStore'

export function DayView() {
  const { dateIso, setDateIso } = useSelectedDate()
  const date = parseISO(dateIso)
  const tasks = useTasksOnDate(dateIso)
  const { toggleDone } = useTaskStore()

  const shiftDay = (delta: number) => setDateIso(format(addDays(date, delta), 'yyyy-MM-dd'))

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => shiftDay(-1)}
          className="rounded-full bg-surface p-2 text-ink-muted shadow-card active:scale-95"
          aria-label="前一天"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-base font-semibold tracking-tight">{format(date, 'yyyy年MM月dd日')}</h1>
          <p className="text-xs text-ink-muted">{format(date, 'EEEE', { locale: zhCN })}</p>
        </div>
        <button
          onClick={() => shiftDay(1)}
          className="rounded-full bg-surface p-2 text-ink-muted shadow-card active:scale-95"
          aria-label="后一天"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <HuangLiCard date={date} />
      <TaskList tasks={tasks} onToggle={toggleDone} />
    </div>
  )
}
