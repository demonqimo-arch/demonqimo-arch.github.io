import allDoneIllustration from '../assets/feirenzai/all-done.png'
import emptyStateIllustration from '../assets/feirenzai/empty-state.png'
import type { Task } from '../types/task'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit?: (task: Task) => void
  emptyText?: string
}

export function TaskList({ tasks, onToggle, onEdit, emptyText = '这一天还没有待办' }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <img src={emptyStateIllustration} alt="" className="h-48 w-auto" />
        <p className="text-sm text-ink-muted">{emptyText}</p>
      </div>
    )
  }

  const allDone = tasks.every((t) => t.isDone)

  return (
    <div className="flex flex-col gap-3">
      {allDone && (
        <div className="flex flex-col items-center gap-1 py-2">
          <img src={allDoneIllustration} alt="" className="h-48 w-auto" />
          <p className="text-sm font-medium text-accent">今天的待办都完成啦</p>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskItem key={task._id} task={task} onToggle={onToggle} onEdit={onEdit} />
        ))}
      </ul>
    </div>
  )
}
