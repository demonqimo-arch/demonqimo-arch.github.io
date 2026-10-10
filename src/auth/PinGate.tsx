import { useState, type FormEvent, type ReactNode } from 'react'
import { getLocalAttempts, type LocalLoginLogEntry } from '../lib/localLoginLog'
import { recordLocalAttempt } from '../lib/localLoginLog'
import { login, WorkerApiError } from '../lib/workerApi'
import { useAuthSession } from './useAuthSession'

const MAX_RETRIES = 2 // 网络类错误最多重试2次（总共最多试3次）
const RETRY_DELAY_MS = 1500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function PinGate({ children }: { children: ReactNode }) {
  const { loggedIn, markLoggedIn } = useAuthSession()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showLog, setShowLog] = useState(false)
  const [localLog, setLocalLog] = useState<LocalLoginLogEntry[]>([])

  if (loggedIn) return <>{children}</>

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setRetryCount(0)
    const trimmedPin = pin.trim()

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      setRetryCount(attempt)
      try {
        await login(trimmedPin)
        setSubmitting(false)
        recordLocalAttempt({ success: true, status: null, code: null, message: null })
        markLoggedIn()
        return
      } catch (err) {
        const isWrongPin = err instanceof WorkerApiError && err.status === 401
        if (isWrongPin) {
          setSubmitting(false)
          recordLocalAttempt({ success: false, status: 401, code: 'invalid_pin', message: null })
          setError('PIN 不对，再试一次')
          setPin('')
          return
        }

        const message = err instanceof Error ? err.message : String(err)
        recordLocalAttempt({ success: false, status: null, code: 'network_error', message })
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS)
          continue
        }
        setSubmitting(false)
        setError('连接较慢或暂时不可用，已自动重试几次仍失败，请稍后再试（不是PIN错了）')
      }
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
          {submitting ? (retryCount > 0 ? `重试中…(${retryCount}/${MAX_RETRIES})` : '验证中…') : '解锁'}
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
                  {entry.time} | {entry.success ? '成功' : '失败'}
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
