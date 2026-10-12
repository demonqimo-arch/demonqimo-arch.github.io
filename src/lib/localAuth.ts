import { recordLocalAttempt } from './localLoginLog'

// 011025 的 SHA-256 哈希，代码里不出现PIN明文；注意：6位数字哈希对有心人来说不难暴力破解，
// 真正的安全边界是"数据仓库是私有的+令牌权限锁定在这一个仓库"，PIN现在主要起UI层面的遮挡作用
const EXPECTED_PIN_HASH = 'b5dfdc0e10fdc74d6766bb0a231181cd4add8aa6b556a44745a48c048ebb83fc'
const UNLOCKED_KEY = 'xingcheng_unlocked'

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isUnlocked(): boolean {
  return localStorage.getItem(UNLOCKED_KEY) === 'true'
}

export async function tryUnlock(pin: string): Promise<boolean> {
  const hash = await sha256Hex(pin)
  const ok = hash === EXPECTED_PIN_HASH
  recordLocalAttempt({
    context: 'login',
    success: ok,
    status: null,
    code: ok ? null : 'wrong_pin',
    message: null,
  })
  if (ok) localStorage.setItem(UNLOCKED_KEY, 'true')
  return ok
}
