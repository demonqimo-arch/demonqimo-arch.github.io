import { addDays, format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { EditTaskSheet } from '../components/EditTaskSheet'
import { HuangLiCard } from '../components/HuangLiCard'
import { TaskList } from '../components/TaskList'
import { useSelectedDate } from '../hooks/useSelectedDate'
import { useTasksOnDate } from '../hooks/useTasks'
import { useTaskStore } from '../store/TaskStore'
import type { Task } from '../types/task'

export function DayView() {
  const { dateIso, setDateIso } = useSelectedDate()
  const date = parseISO(dateIso)
  const tasks = useTasksOnDate(dateIso)
  const { toggleDone, updateTask } = useTaskStore()
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const todayIso = format(new Date(), 'yyyy-MM-dd')
  const isToday = dateIso === todayIso

  const shiftDay = (delta: number) => setDateIso(format(addDays(date, delta), 'yyyy-MM-dd'))
  const goToToday = () => setDateIso(todayIso)

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
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-ink-muted">{format(date, 'EEEE', { locale: zhCN })}</p>
            {!isToday && (
              <button onClick={goToToday} className="text-xs font-medium text-accent">
                回到今天
              </button>
            )}
          </div>
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
      <TaskList tasks={tasks} onToggle={toggleDone} onEdit={setEditingTask} />

      <EditTaskSheet task={editingTask} onClose={() => setEditingTask(null)} onSave={updateTask} />
    </div>
  )
}
