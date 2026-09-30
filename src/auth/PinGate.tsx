import { useState, type FormEvent, type ReactNode } from 'react'
import { logLoginAttempt } from '../lib/loginLog'
import { supabase } from '../lib/supabase'
import { useAuthSession } from './useAuthSession'

const OWNER_EMAIL = 'owner@xingcheng.app'

export function PinGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuthSession()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null

  if (session) return <>{children}</>

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const trimmedPin = pin.trim()
    const { error } = await supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password: trimmedPin })
    setSubmitting(false)

    logLoginAttempt(!error, error)

    if (error) {
      const isWrongPin = error.status === 400 && error.code === 'invalid_credentials'
      if (isWrongPin) {
        setError('PIN 不对，再试一次')
        setPin('')
      } else {
        // 网络慢/服务暂时唤醒中等非密码错误，不清空已输入的PIN，提示明确一点，用户直接重试即可
        setError('连接较慢或暂时不可用，请稍等几秒再试一次（不是PIN错了）')
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
          {submitting ? '验证中…' : '解锁'}
        </button>
      </form>
    </div>
  )
}
