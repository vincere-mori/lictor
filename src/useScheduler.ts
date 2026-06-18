import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { nextFire } from './lib/escalation'
import type { Tier } from './lib/time'

const TITLE: Record<Tier, string> = {
  MONEO: 'Напоминаю',
  INSTO: 'Пора. Не тяни',
  COGO: 'Делай. Сейчас'
}

// планировщик для открытого приложения: ставит таймеры на ближайшее
// срабатывание каждой активной задачи и шлёт уведомление
export function useScheduler() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').toArray(), [], [])

  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const now = Date.now()
    const timers: number[] = []
    for (const t of tasks) {
      const fire = nextFire(t.due, t.tier, now)
      if (fire === null) continue
      const delay = fire - now
      if (delay < 0 || delay > 2_147_000_000) continue
      const id = window.setTimeout(() => {
        new Notification(TITLE[t.tier], { body: t.title, tag: t.id })
        db.events.add({ taskId: t.id, type: 'fired', tier: t.tier, ts: Date.now() })
      }, delay)
      timers.push(id)
    }
    return () => timers.forEach((id) => clearTimeout(id))
  }, [tasks])
}
