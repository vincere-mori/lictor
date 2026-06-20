export type Tier = 'MONEO' | 'INSTO' | 'COGO'

export function formatLeft(deltaMs: number): { overdue: boolean; text: string } {
  if (deltaMs < 0) return { overdue: true, text: 'просрочено' }

  const m = Math.floor(deltaMs / 60000)
  if (m < 1) return { overdue: false, text: 'сейчас' }
  if (m < 60) return { overdue: false, text: `через ${m} мин` }

  const h = Math.floor(m / 60)
  if (h < 24) return { overdue: false, text: `через ${h} ч` }

  const d = Math.floor(h / 24)
  return { overdue: false, text: `через ${d} дн` }
}

export function overdueClock(deltaMs: number): string {
  const s = Math.max(0, Math.floor(-deltaMs / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `−${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  return `−${m}:${String(ss).padStart(2, '0')}`
}
