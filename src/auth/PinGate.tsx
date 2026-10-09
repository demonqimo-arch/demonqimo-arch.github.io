import { useState, type FormEvent, type ReactNode } from 'react'
import { getLocalAttempts, type LocalLoginLogEntry } from '../lib/localLoginLog'
import { logLoginAttempt } from '../lib/loginLog'
import { supabase } from '../lib/supabase'
import { TimeoutError, withTimeout } from '../lib/withTimeout'
import { useAuthSession } from './useAuthSession'

const OWNER_EMAIL = 'owner@xingcheng.app'
const SIGN_IN_TIMEOUT_MS = 15000

export function PinGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuthSession()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
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
    const trimmedPin = pin.trim()

    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password: trimmedPin }),
        SIGN_IN_TIMEOUT_MS,
      )
      setSubmitting(false)

      if (error) {
        logLoginAttempt(false, error.status ?? null, error.code ?? null, error.message)
        const isWrongPin = error.status === 400 && error.code === 'invalid_credentials'
        if (isWrongPin) {
          setError('PIN 不对，再试一次')
          setPin('')
        } else {
          // 网络慢/服务暂时唤醒中等非密码错误，不清空已输入的PIN，提示明确一点，用户直接重试即可
          setError('连接较慢或暂时不可用，请稍等几秒再试一次（不是PIN错了）')
        }
      } else {
        logLoginAttempt(true, null, null, null)
      }
    } catch (err) {
      setSubmitting(false)
      const isTimeout = err instanceof TimeoutError
      logLoginAttempt(false, null, isTimeout ? 'client_timeout' : 'client_error', String(err))
      setError(
        isTimeout
          ? `连接超时（超过${SIGN_IN_TIMEOUT_MS / 1000}秒无响应），请检查网络后重试（不是PIN错了）`
          : '连接出错，请稍后重试',
      )
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
