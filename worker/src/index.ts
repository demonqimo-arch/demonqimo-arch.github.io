export interface Env {
  APP_PIN: string
  SESSION_SECRET: string
  GITHUB_TOKEN: string
  GITHUB_REPO: string
  DATA_FILE_PATH: string
  ALLOWED_ORIGIN: string
}

const SESSION_TTL_MS = 180 * 24 * 60 * 60 * 1000 // 180天

function corsHeaders(env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function json(data: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  })
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function issueToken(env: Env): Promise<string> {
  const payload = btoa(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }))
  const sig = await hmac(payload, env.SESSION_SECRET)
  return `${payload}.${sig}`
}

async function verifyToken(token: string | null, env: Env): Promise<boolean> {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expectedSig = await hmac(payload, env.SESSION_SECRET)
  if (sig !== expectedSig) return false
  try {
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice('Bearer '.length)
}

interface GithubFile {
  sha: string
  content: string // base64
}

async function githubGetFile(env: Env): Promise<GithubFile | null> {
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${env.DATA_FILE_PATH}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'xingcheng-worker',
    },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as GithubFile
  return data
}

async function githubPutFile(env: Env, content: string, sha: string | null): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${env.DATA_FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'xingcheng-worker',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `update tasks ${new Date().toISOString()}`,
      content: btoa(unescape(encodeURIComponent(content))),
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { content: { sha: string } }
  return data.content.sha
}

function decodeBase64Utf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64)))
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) })
    }

    if (url.pathname === '/login' && request.method === 'POST') {
      const body = (await request.json().catch(() => null)) as { pin?: string } | null
      if (!body?.pin || body.pin !== env.APP_PIN) {
        return json({ error: 'invalid_pin' }, 401, env)
      }
      const token = await issueToken(env)
      return json({ token }, 200, env)
    }

    if (url.pathname === '/tasks' && request.method === 'GET') {
      const token = getBearerToken(request)
      if (!(await verifyToken(token, env))) return json({ error: 'unauthorized' }, 401, env)

      const file = await githubGetFile(env)
      if (!file) return json({ tasks: [], sha: null }, 200, env)
      const tasks = JSON.parse(decodeBase64Utf8(file.content))
      return json({ tasks, sha: file.sha }, 200, env)
    }

    if (url.pathname === '/tasks' && request.method === 'PUT') {
      const token = getBearerToken(request)
      if (!(await verifyToken(token, env))) return json({ error: 'unauthorized' }, 401, env)

      const body = (await request.json().catch(() => null)) as { tasks?: unknown; sha?: string | null } | null
      if (!body || !Array.isArray(body.tasks)) return json({ error: 'invalid_body' }, 400, env)

      const newSha = await githubPutFile(env, JSON.stringify(body.tasks, null, 2), body.sha ?? null)
      return json({ sha: newSha }, 200, env)
    }

    return json({ error: 'not_found' }, 404, env)
  },
}
