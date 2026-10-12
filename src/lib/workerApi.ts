import { recordLocalAttempt } from './localLoginLog'
import type { Task } from '../types/task'

const WORKER_URL = 'https://xingcheng-worker.3156400437.workers.dev'
const TOKEN_KEY = 'xingcheng_token'

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

/** 订阅"登录凭证已失效"事件，PinGate 用它来在数据请求半路被拒绝时自动弹回登录界面 */
export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((fn) => fn())
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** 不需要联网，本地解析token里的过期时间，快速判断"看起来有没有登录" */
export function hasValidLocalToken(): boolean {
  const token = getStoredToken()
  if (!token) return false
  const payload = token.split('.')[0]
  try {
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

export async function login(pin: string): Promise<void> {
  const res = await fetch(`${WORKER_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new WorkerApiError(res.status, body.error ?? 'login_failed')
  }
  const { token } = (await res.json()) as { token: string }
  setStoredToken(token)
}

export class WorkerApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string) {
    super(code)
    this.status = status
    this.code = code
  }
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getStoredToken()
  const res = await fetch(`${WORKER_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token ?? ''}`,
    },
  })
  if (res.status === 401) {
    clearStoredToken()
    notifyUnauthorized()
    throw new WorkerApiError(401, 'unauthorized')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new WorkerApiError(res.status, body.error ?? 'request_failed')
  }
  return res
}

export interface TasksPayload {
  tasks: Task[]
  sha: string | null
}

export async function fetchTasksFromWorker(): Promise<TasksPayload> {
  try {
    const res = await authedFetch('/tasks', { method: 'GET' })
    const data = (await res.json()) as TasksPayload
    recordLocalAttempt({ context: 'fetch_tasks', success: true, status: null, code: null, message: null })
    return data
  } catch (err) {
    recordLocalAttempt({
      context: 'fetch_tasks',
      success: false,
      status: err instanceof WorkerApiError ? err.status : null,
      code: err instanceof WorkerApiError ? err.code : 'network_error',
      message: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}

export async function saveTasksToWorker(tasks: Task[], sha: string | null): Promise<string> {
  try {
    const res = await authedFetch('/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, sha }),
    })
    const data = (await res.json()) as { sha: string }
    recordLocalAttempt({ context: 'save_tasks', success: true, status: null, code: null, message: null })
    return data.sha
  } catch (err) {
    recordLocalAttempt({
      context: 'save_tasks',
      success: false,
      status: err instanceof WorkerApiError ? err.status : null,
      code: err instanceof WorkerApiError ? err.code : 'network_error',
      message: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}
