import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/TaskStore'
import { REMINDER_LEAD_OPTIONS, type Task } from '../types/task'

interface Props {
  task: Task | null
  onClose: () => void
  onSave: (id: string, changes: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => void
}

function minutesToTimeString(minutes: number | null) {
  if (minutes == null) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function EditTaskSheet({ task, onClose, onSave }: Props) {
  const { tags: existingTags } = useTaskStore()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [tag, setTag] = useState('')
  const [noDate, setNoDate] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderLeadMinutes, setReminderLeadMinutes] = useState<0 | 10 | 30 | 60>(0)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setNote(task.note ?? '')
    setTag(task.tag ?? '')
    setNoDate(task.dueDate == null)
    setDueDate(task.dueDate ?? '')
    setDueTime(minutesToTimeString(task.dueTimeMinutes))
    setReminderEnabled(task.reminderEnabled)
    setReminderLeadMinutes(task.reminderLeadMinutes)
  }, [task])

  if (!task) return null

  const handleSubmit = () => {
    if (!title.trim()) return
    const [h, m] = dueTime ? dueTime.split(':').map(Number) : [null, null]
    onSave(task._id, {
      title: title.trim(),
      note: note.trim() || null,
      tag: tag.trim() || null,
      dueDate: noDate ? null : dueDate,
      dueTimeMinutes: !noDate && h != null && m != null ? h * 60 + m : null,
      isDone: task.isDone,
      reminderEnabled: !noDate && reminderEnabled && !!dueTime,
      reminderLeadMinutes,
    })
    onClose()
  }

  return (
    <Dialog open={!!task} onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 flex justify-center">
        <DialogPanel className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-8">
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line" />
          <DialogTitle className="text-base font-semibold tracking-tight">编辑待办</DialogTitle>

          <div className="mt-4 flex flex-col gap-3">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="标题"
              className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="备注（可选）"
              className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="标签（可选，比如 宋阳）"
              list="edit-task-tag-options"
              className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <datalist id="edit-task-tag-options">
              {existingTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>

            <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
              <span className="text-sm">不设置具体日期</span>
              <Switch
                checked={noDate}
                onChange={setNoDate}
                className={`${noDate ? 'bg-accent' : 'bg-line'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className={`${noDate ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
              </Switch>
            </div>

            {!noDate && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            )}

            {!noDate && (
              <>
                <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
                  <span className="text-sm">开启提醒</span>
                  <Switch
                    checked={reminderEnabled}
                    onChange={setReminderEnabled}
                    disabled={!dueTime}
                    className={`${reminderEnabled ? 'bg-accent' : 'bg-line'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40`}
                  >
                    <span className={`${reminderEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </Switch>
                </div>
                {!dueTime && <p className="-mt-2 text-xs text-ink-muted">提醒需要先设置具体时间</p>}
              </>
            )}

            {!noDate && reminderEnabled && (
              <div className="flex flex-wrap gap-2">
                {REMINDER_LEAD_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    onClick={() => setReminderLeadMinutes(opt.minutes)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      reminderLeadMinutes === opt.minutes ? 'bg-accent text-white' : 'bg-canvas text-ink-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl bg-canvas py-2 text-sm font-medium text-ink-muted">
              取消
            </button>
            <button onClick={handleSubmit} className="flex-1 rounded-xl bg-accent py-2 text-sm font-medium text-white">
              保存
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
