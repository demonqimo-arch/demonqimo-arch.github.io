import { supabase } from './supabase'

export function logLoginAttempt(
  success: boolean,
  status: number | null,
  code: string | null,
  message: string | null,
) {
  // 诊断用：记录每次登录尝试的结果，方便排查"PIN没输错却提示错误""卡住不报错"这类问题，不影响登录流程本身
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
