import type { Tier } from './time'

export interface Parsed {
  title: string
  due: number
  tier: Tier
  explicitTime: boolean
  daySet: boolean
}

const UNITS: Record<string, number> = {
  минут: 60e3,
  минуту: 60e3,
  минуты: 60e3,
  мин: 60e3,
  часов: 3600e3,
  часа: 3600e3,
  час: 3600e3,
  ч: 3600e3,
  дней: 86400e3,
  дня: 86400e3,
  день: 86400e3,
  д: 86400e3
}

export function parseInput(text: string, now = Date.now()): Parsed | null {
  const raw = text.trim()
  if (!raw) return null
  const lower = raw.toLowerCase()

  let tier: Tier = 'INSTO'
  if (/жёстк|жестк|важн|критич|срочн/.test(lower)) tier = 'COGO'
  else if (/мягк|тих|спокойн|потом/.test(lower)) tier = 'MONEO'

  let dayShift = 0
  let daySet = false
  if (/послезавтра/.test(lower)) { dayShift = 2; daySet = true }
  else if (/завтра/.test(lower)) { dayShift = 1; daySet = true }
  else if (/сегодня/.test(lower)) { dayShift = 0; daySet = true }

  let due: number | null = null
  let explicitTime = false

  const rel = lower.match(/через\s+(\d+)\s*([а-яё]+)/)
  if (rel) {
    const n = parseInt(rel[1], 10)
    const key = Object.keys(UNITS).find((u) => rel[2].startsWith(u))
    if (key) {
      due = now + n * UNITS[key]
      explicitTime = true
    }
  }

  if (due === null) {
    const hm = lower.match(/(?:в\s*)?(\d{1,2})[:.](\d{2})/)
    const hOnly = lower.match(/\bв\s+(\d{1,2})(?:\s*(?:ч|час|часа|часов))?\b/)
    const d = new Date(now)
    d.setSeconds(0, 0)
    d.setDate(d.getDate() + dayShift)
    if (hm) {
      d.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10))
      due = d.getTime()
      explicitTime = true
      if (!daySet && due <= now) due += 86400e3
    } else if (hOnly) {
      d.setHours(parseInt(hOnly[1], 10), 0)
      due = d.getTime()
      explicitTime = true
      if (!daySet && due <= now) due += 86400e3
    } else if (daySet) {
      d.setHours(9, 0)
      due = d.getTime()
    }
  }

  if (due === null) due = now + 3600e3

  let title = raw
    .replace(/через\s+\d+\s*[а-яё]+/gi, ' ')
    .replace(/(?:в\s*)?\d{1,2}[:.]\d{2}/g, ' ')
    .replace(/\bв\s+\d{1,2}(?:\s*(?:ч|час|часа|часов))?\b/gi, ' ')
    .replace(/послезавтра|завтра|сегодня/gi, ' ')
    .replace(/жёстко|жестко|важно|критично|срочно|мягко|тихо|спокойно|потом/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!title) title = raw

  return { title, due, tier, explicitTime, daySet }
}
