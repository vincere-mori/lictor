import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Capacitor } from '@capacitor/core'
import { db } from './db'
import { nextFire, occurrences } from './lib/escalation'
import type { Tier } from './lib/time'
import { pushConfigured, pushEnabled, syncPush, type PushOcc } from './push'

const TITLE: Record<Tier, string> = {
  MONEO: 'Напоминаю',
  INSTO: 'Пора. Не тяни',
  COGO: 'Делай. Сейчас'
}

// Android: нативные локальные уведомления (живут после закрытия).
// Веб: setTimeout пока вкладка открыта + синк расписания на пуш-бэкенд (для закрытого iPhone).
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

    const now = Date.now()

    if (pushConfigured() && pushEnabled()) {
      const list: PushOcc[] = []
      for (const t of tasks) {
        for (const fireAt of occurrences(t.due, t.tier).filter((x) => x > now).slice(0, 6)) {
          list.push({ fireAt, title: t.title, tier: t.tier })
        }
      }
      syncPush(list)
    }

    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
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
