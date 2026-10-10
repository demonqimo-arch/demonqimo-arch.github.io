import type { Task } from '../types/task'

const WORKER_URL = 'https://xingcheng-worker.3156400437.workers.dev'
const TOKEN_KEY = 'xingcheng_token'

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
  const res = await authedFetch('/tasks', { method: 'GET' })
  return (await res.json()) as TasksPayload
}

export async function saveTasksToWorker(tasks: Task[], sha: string | null): Promise<string> {
  const res = await authedFetch('/tasks', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, sha }),
  })
  const data = (await res.json()) as { sha: string }
  return data.sha
}
