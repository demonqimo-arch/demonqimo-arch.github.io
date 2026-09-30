import type { AuthError } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function logLoginAttempt(success: boolean, error: AuthError | null) {
  // 诊断用：记录每次登录尝试的结果，方便排查"PIN没输错却提示错误"这类问题，不影响登录流程本身
  void supabase
    .from('login_attempts')
    .insert({
      success,
      error_status: error?.status ?? null,
      error_code: error?.code ?? null,
      error_message: error?.message ?? null,
      user_agent: navigator.userAgent,
    })
    .then(() => {})
}
