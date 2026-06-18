import type { Tier } from './time'

export interface Ladder {
  repeatEvery: number
  maxRepeats: number
}

export const LADDER: Record<Tier, Ladder> = {
  MONEO: { repeatEvery: 0, maxRepeats: 0 },
  INSTO: { repeatEvery: 10 * 60e3, maxRepeats: 6 },
  COGO: { repeatEvery: 3 * 60e3, maxRepeats: 20 }
}

// все моменты срабатывания: due плюс повторы эскалации после него
export function occurrences(due: number, tier: Tier): number[] {
  const l = LADDER[tier]
  const out = [due]
  for (let i = 1; i <= l.maxRepeats; i++) out.push(due + i * l.repeatEvery)
  return out
}

// ближайшее срабатывание строго после now, либо null если лестница исчерпана
export function nextFire(due: number, tier: Tier, now: number): number | null {
  for (const t of occurrences(due, tier)) if (t > now) return t
  return null
}

// текущий уровень эскалации (0 пока не наступил срок)
export function level(due: number, tier: Tier, now: number): number {
  if (now < due) return 0
  const l = LADDER[tier]
  if (l.repeatEvery === 0) return 1
  return Math.min(l.maxRepeats + 1, 1 + Math.floor((now - due) / l.repeatEvery))
}
