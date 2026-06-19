const API = import.meta.env.VITE_PUSH_API

export function pushConfigured(): boolean {
  return typeof API === 'string' && API.length > 0
}

export function pushEnabled(): boolean {
  try {
    return localStorage.getItem('lictor-push') === '1'
  } catch {
    return false
  }
}

function deviceId(): string {
  let d = ''
  try {
    d = localStorage.getItem('lictor-device') || ''
  } catch {
    d = ''
  }
  if (!d) {
    d = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    try {
      localStorage.setItem('lictor-device', d)
    } catch {
      // нет localStorage
    }
  }
  return d
}

function urlB64ToUint8(b64: string): Uint8Array {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const base = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export type PushResult = 'ok' | 'denied' | 'unsupported' | 'no-api' | 'error'

export async function enablePush(): Promise<PushResult> {
  if (!pushConfigured()) return 'no-api'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
    return 'unsupported'
  }
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return 'denied'
  try {
    const reg = await navigator.serviceWorker.ready
    const key = (await fetch(`${API}/vapid`).then((r) => r.text())).trim()
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(key) as BufferSource })
    await fetch(`${API}/subscribe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId(), subscription: sub })
    })
    try {
      localStorage.setItem('lictor-push', '1')
    } catch {
      // нет localStorage
    }
    return 'ok'
  } catch {
    return 'error'
  }
}

export interface PushOcc {
  fireAt: number
  title: string
  tier: string
}

export async function syncPush(occurrences: PushOcc[]): Promise<void> {
  if (!pushConfigured() || !pushEnabled()) return
  try {
    await fetch(`${API}/sync`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId(), occurrences })
    })
  } catch {
    // оффлайн - синхронизируется при следующем изменении
  }
}
