import { useState, type FormEvent, type ReactNode } from 'react'
import { getLocalAttempts, type LocalLoginLogEntry } from '../lib/localLoginLog'
import { logLoginAttempt } from '../lib/loginLog'
import { supabase } from '../lib/supabase'
import { TimeoutError, withTimeout } from '../lib/withTimeout'
import { useAuthSession } from './useAuthSession'

const OWNER_EMAIL = 'owner@xingcheng.app'
const SIGN_IN_TIMEOUT_MS = 15000
const MAX_RETRIES = 2 // 网络类错误最多重试2次（总共最多试3次）
const RETRY_DELAY_MS = 1500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function PinGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuthSession()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showLog, setShowLog] = useState(false)
  const [localLog, setLocalLog] = useState<LocalLoginLogEntry[]>([])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <p className="text-sm text-ink-muted">正在连接…</p>
      </div>
    )
  }

  if (session) return <>{children}</>

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setRetryCount(0)
    const trimmedPin = pin.trim()

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      setRetryCount(attempt)
      try {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password: trimmedPin }),
          SIGN_IN_TIMEOUT_MS,
        )

        if (!error) {
          setSubmitting(false)
          logLoginAttempt(true, null, null, null)
          return
        }

        logLoginAttempt(false, error.status ?? null, error.code ?? null, error.message)
        const isWrongPin = error.status === 400 && error.code === 'invalid_credentials'
        if (isWrongPin) {
          // 真的密码错，不用重试
          setSubmitting(false)
          setError('PIN 不对，再试一次')
          setPin('')
          return
        }

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS)
          continue
        }
        setSubmitting(false)
        setError('连接较慢或暂时不可用，已自动重试几次仍失败，请稍后再试（不是PIN错了）')
      } catch (err) {
        const isTimeout = err instanceof TimeoutError
        logLoginAttempt(false, null, isTimeout ? 'client_timeout' : 'client_error', String(err))
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS)
          continue
        }
        setSubmitting(false)
        setError(
          isTimeout
            ? '连接超时，已自动重试几次仍无响应，请检查网络后再试（不是PIN错了）'
            : '连接出错，已自动重试几次仍失败，请稍后再试',
        )
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
