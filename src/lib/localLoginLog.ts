const STORAGE_KEY = 'xingcheng_login_log'
const MAX_ENTRIES = 20

export interface LocalLoginLogEntry {
  time: string
  success: boolean
  status: number | null
  code: string | null
  message: string | null
}

export function recordLocalAttempt(entry: Omit<LocalLoginLogEntry, 'time'>) {
  try {
    const list = getLocalAttempts()
    list.unshift({ time: new Date().toISOString(), ...entry })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)))
  } catch {
    // localStorage 不可用时（极少数情况）直接放弃本地记录，不影响登录流程
  }
}

export function getLocalAttempts(): LocalLoginLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
