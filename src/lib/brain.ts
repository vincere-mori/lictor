export interface BrainEvent {
  type: string
  ts: number
}

// сколько задач завершено в каждый час суток (0..23)
export function hourlyResponse(events: BrainEvent[]): number[] {
  const h = new Array(24).fill(0)
  for (const e of events) if (e.type === 'done') h[new Date(e.ts).getHours()]++
  return h
}

// час с лучшим откликом, дефолт 9 если данных нет
export function bestHour(scores: number[]): number {
  let bi = 9
  let bv = 0
  for (let i = 0; i < 24; i++) {
    if (scores[i] > bv) {
      bv = scores[i]
      bi = i
    }
  }
  return bi
}

// окно 3 часа с максимальной суммой откликов
export function bestWindow(scores: number[]): { start: number; end: number; share: number } | null {
  const total = scores.reduce((a, b) => a + b, 0)
  if (total === 0) return null
  let bs = 0
  let bsum = -1
  for (let i = 0; i < 24; i++) {
    const sum = scores[i] + scores[(i + 1) % 24] + scores[(i + 2) % 24]
    if (sum > bsum) {
      bsum = sum
      bs = i
    }
  }
  return { start: bs, end: (bs + 3) % 24, share: Math.round((bsum / total) * 100) }
}
