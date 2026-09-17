import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { EditTaskSheet } from '../components/EditTaskSheet'
import { TaskItem } from '../components/TaskItem'
import { useTaskStore } from '../store/TaskStore'
import type { Task } from '../types/task'

type Filter = 'all' | 'pending' | 'done'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '未完成' },
  { key: 'done', label: '已完成' },
]

function dateLabel(task: Task) {
  if (!task.dueDate) return '无日期'
  const d = parseISO(task.dueDate)
  return `${format(d, 'M月d日')} ${format(d, 'EEE', { locale: zhCN })}`
}

function sortByDate(list: Task[], direction: 'asc' | 'desc') {
  const dated = list.filter((t) => t.dueDate != null)
  const undated = list.filter((t) => t.dueDate == null)
  dated.sort((a, b) => (direction === 'asc' ? a.dueDate!.localeCompare(b.dueDate!) : b.dueDate!.localeCompare(a.dueDate!)))
  return [...dated, ...undated]
}

export function AllTasksView() {
  const { tasks, tags, toggleDone, updateTask } = useTaskStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const filteredTasks = useMemo(
    () => (tagFilter ? tasks.filter((t) => t.tag === tagFilter) : tasks),
    [tasks, tagFilter],
  )

  const pending = useMemo(() => sortByDate(filteredTasks.filter((t) => !t.isDone), 'asc'), [filteredTasks])
  const done = useMemo(() => sortByDate(filteredTasks.filter((t) => t.isDone), 'desc'), [filteredTasks])

  const showPending = filter !== 'done'
  const showDone = filter !== 'pending'

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <h1 className="text-base font-semibold tracking-tight">全部待办</h1>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key ? 'bg-accent text-white' : 'bg-surface text-ink-muted shadow-card'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tagFilter === t ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {showPending && (
        <div className="flex flex-col gap-2">
          {filter === 'all' && <p className="text-xs font-medium text-ink-muted">未完成 ({pending.length})</p>}
          {pending.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-muted">没有未完成的待办</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pending.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggle={toggleDone}
                  dateLabel={dateLabel(task)}
                  onEdit={setEditingTask}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {showDone && (
        <div className="flex flex-col gap-2">
          {filter === 'all' && <p className="text-xs font-medium text-ink-muted">已完成 ({done.length})</p>}
          {done.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-muted">还没有完成的待办</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {done.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggle={toggleDone}
                  dateLabel={dateLabel(task)}
                  onEdit={setEditingTask}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <EditTaskSheet task={editingTask} onClose={() => setEditingTask(null)} onSave={updateTask} />
    </div>
  )
}
