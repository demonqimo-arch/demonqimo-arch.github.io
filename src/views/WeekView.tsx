import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditTaskSheet } from '../components/EditTaskSheet'
import { TaskList } from '../components/TaskList'
import { WeekDayColumn } from '../components/WeekDayColumn'
import { useSelectedDate } from '../hooks/useSelectedDate'
import { useTasksInRange, useTasksOnDate } from '../hooks/useTasks'
import { getHolidayBadge } from '../lib/holidays'
import { useTaskStore } from '../store/TaskStore'
import type { Task } from '../types/task'

export function WeekView() {
  const { dateIso, setDateIso } = useSelectedDate()
  const navigate = useNavigate()
  const { toggleDone, updateTask } = useTaskStore()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const selected = parseISO(dateIso)
  const weekStart = startOfWeek(selected, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayIso = format(new Date(), 'yyyy-MM-dd')

  const rangeStart = format(days[0], 'yyyy-MM-dd')
  const rangeEnd = format(days[6], 'yyyy-MM-dd')
  const tasks = useTasksInRange(rangeStart, rangeEnd)
  const selectedDayTasks = useTasksOnDate(dateIso)

  const goToDay = (iso: string) => {
    setDateIso(iso)
    navigate(`/day?date=${iso}`)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <h1 className="text-base font-semibold tracking-tight">
        {format(weekStart, 'yyyy年MM月')} 第{format(weekStart, 'w')}周
      </h1>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd')
          const dayTasks = tasks.filter((t) => t.dueDate === iso)
          const weekday = day.getDay()
          return (
            <WeekDayColumn
              key={iso}
              weekdayLabel={format(day, 'EEE', { locale: zhCN })}
              dayLabel={format(day, 'd')}
              tasks={dayTasks}
              isToday={iso === todayIso}
              isSelected={iso === dateIso}
              isWeekend={weekday === 0 || weekday === 6}
              holiday={getHolidayBadge(iso)}
              onClick={() => goToDay(iso)}
            />
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-ink-muted">
          {format(selected, 'M月d日')} {format(selected, 'EEEE', { locale: zhCN })} 待办
        </p>
        <TaskList tasks={selectedDayTasks} onToggle={toggleDone} onEdit={setEditingTask} />
      </div>

      <EditTaskSheet task={editingTask} onClose={() => setEditingTask(null)} onSave={updateTask} />
    </div>
  )
}
