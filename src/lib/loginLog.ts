import { recordLocalAttempt } from './localLoginLog'
import { supabase } from './supabase'

export function logLoginAttempt(
  success: boolean,
  status: number | null,
  code: string | null,
  message: string | null,
) {
  // 先存本地（不需要联网，网络不好时也能留下记录），再尽量同步一份到数据库
  recordLocalAttempt({ success, status, code, message })

  void supabase
    .from('login_attempts')
    .insert({
      success,
      error_status: status,
      error_code: code,
      error_message: message,
      user_agent: navigator.userAgent,
    })
    .then(() => {})
}
