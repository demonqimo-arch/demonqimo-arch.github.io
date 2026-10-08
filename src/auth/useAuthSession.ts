import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { withTimeout } from '../lib/withTimeout'

const SESSION_CHECK_TIMEOUT_MS = 12000

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    withTimeout(supabase.auth.getSession(), SESSION_CHECK_TIMEOUT_MS)
      .then(({ data }) => {
        if (cancelled) return
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => {
        // 超时或网络异常：当作"未登录"处理，弹出 PIN 输入框，而不是一直停在空白页面
        if (cancelled) return
        setSession(null)
        setLoading(false)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
