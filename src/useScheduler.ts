import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Capacitor } from '@capacitor/core'
import { db } from './db'
import { nextFire } from './lib/escalation'
import type { Tier } from './lib/time'

const TITLE: Record<Tier, string> = {
  MONEO: 'Напоминаю',
  INSTO: 'Пора. Не тяни',
  COGO: 'Делай. Сейчас'
}

// Android: нативные локальные уведомления (живут после закрытия).
// Веб: setTimeout пока вкладка открыта.
export function useScheduler() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').toArray(), [], [])

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      let cancelled = false
      import('./schedulers/native').then((m) => {
        if (!cancelled) m.rescheduleNative(tasks)
      })
      return () => {
        cancelled = true
      }
    }

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
