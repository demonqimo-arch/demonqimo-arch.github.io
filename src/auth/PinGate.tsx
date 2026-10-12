import { useState, type FormEvent, type ReactNode } from 'react'
import { getLocalAttempts, type LocalLoginLogEntry } from '../lib/localLoginLog'
import { tryUnlock } from '../lib/localAuth'
import { useAuthSession } from './useAuthSession'

export function PinGate({ children }: { children: ReactNode }) {
  const { loggedIn, markLoggedIn } = useAuthSession()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [localLog, setLocalLog] = useState<LocalLoginLogEntry[]>([])

  if (loggedIn) return <>{children}</>

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const ok = await tryUnlock(pin.trim())
    setSubmitting(false)
    if (ok) {
      markLoggedIn()
    } else {
      setError('PIN 不对，再试一次')
      setPin('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-4 rounded-3xl bg-surface p-6 shadow-card"
      >
        <h1 className="text-center text-base font-semibold tracking-tight">行程管家</h1>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="输入 PIN"
          className="rounded-xl border border-line px-3 py-2 text-center text-lg tracking-widest outline-none focus:border-accent"
        />
        {error && <p className="text-center text-xs text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !pin}
          className="rounded-xl bg-accent py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? '验证中…' : '解锁'}
        </button>

        <button
          type="button"
          onClick={() => {
            setLocalLog(getLocalAttempts())
            setShowLog((v) => !v)
          }}
          className="text-center text-[11px] text-ink-muted underline"
        >
          {showLog ? '收起诊断日志' : '查看本地诊断日志'}
        </button>

        {showLog && (
          <div className="max-h-48 overflow-y-auto rounded-xl bg-canvas p-2 text-[10px] text-ink-muted">
            {localLog.length === 0 ? (
              <p>本机还没有记录</p>
            ) : (
              localLog.map((entry, i) => (
                <p key={i} className="border-b border-line py-1 last:border-0">
                  {entry.time} | {entry.context} | {entry.success ? '成功' : '失败'}
                  {!entry.success && ` | status:${entry.status} code:${entry.code} msg:${entry.message}`}
                </p>
              ))
            )}
          </div>
        )}
      </form>
    </div>
  )
}
