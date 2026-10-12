import { recordLocalAttempt } from './localLoginLog'
import type { Task } from '../types/task'
import { withTimeout } from './withTimeout'

// 权限已锁定在 xingcheng-data 这一个私有仓库，Contents 读写，即使泄露影响范围也有限
// 注意：这个令牌最终还是会被打包进发布到网页上的 JS 文件里（这是这套"直连GitHub"方案本身的取舍，不是能避免的），
// 这里用环境变量而不是直接写死在源码里，只是为了让仓库的提交历史/源码本身不直接出现明文
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string
const GITHUB_REPO = 'demonqimo-arch/xingcheng-data'
const DATA_FILE_PATH = 'tasks.json'
const FETCH_TIMEOUT_MS = 15000

export class GithubApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function githubFetch(path: string, init?: RequestInit): Promise<Response> {
  return withTimeout(
    fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        ...init?.headers,
      },
    }),
    FETCH_TIMEOUT_MS,
  )
}

function decodeBase64Utf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))))
}

function encodeUtf8Base64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export interface TasksPayload {
  tasks: Task[]
  sha: string | null
}

export async function fetchTasksFromGithub(): Promise<TasksPayload> {
  try {
    const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`)
    if (res.status === 404) {
      recordLocalAttempt({ context: 'fetch_tasks', success: true, status: null, code: null, message: null })
      return { tasks: [], sha: null }
    }
    if (!res.ok) throw new GithubApiError(res.status, await res.text())
    const data = (await res.json()) as { content: string; sha: string }
    const tasks = JSON.parse(decodeBase64Utf8(data.content)) as Task[]
    recordLocalAttempt({ context: 'fetch_tasks', success: true, status: null, code: null, message: null })
    return { tasks, sha: data.sha }
  } catch (err) {
    recordLocalAttempt({
      context: 'fetch_tasks',
      success: false,
      status: err instanceof GithubApiError ? err.status : null,
      code: err instanceof GithubApiError ? 'github_error' : 'network_error',
      message: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}

export async function saveTasksToGithub(tasks: Task[], sha: string | null): Promise<string> {
  try {
    const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `update tasks ${new Date().toISOString()}`,
        content: encodeUtf8Base64(JSON.stringify(tasks, null, 2)),
        ...(sha ? { sha } : {}),
      }),
    })
    if (!res.ok) throw new GithubApiError(res.status, await res.text())
    const data = (await res.json()) as { content: { sha: string } }
    recordLocalAttempt({ context: 'save_tasks', success: true, status: null, code: null, message: null })
    return data.content.sha
  } catch (err) {
    recordLocalAttempt({
      context: 'save_tasks',
      success: false,
      status: err instanceof GithubApiError ? err.status : null,
      code: err instanceof GithubApiError ? 'github_error' : 'network_error',
      message: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}
