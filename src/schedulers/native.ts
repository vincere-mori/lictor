import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications'
import type { Task } from '../db'
import type { Tier } from '../lib/time'
import { occurrences } from '../lib/escalation'

const TITLE: Record<Tier, string> = {
  MONEO: 'Напоминаю',
  INSTO: 'Пора. Не тяни',
  COGO: 'Делай. Сейчас'
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h) % 1_000_00
}

// пересобрать все локальные уведомления под текущие активные задачи
export async function rescheduleNative(tasks: Task[]) {
  const perm = await LocalNotifications.checkPermissions()
  if (perm.display !== 'granted') {
    const req = await LocalNotifications.requestPermissions()
    if (req.display !== 'granted') return
  }

  const pending = await LocalNotifications.getPending()
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) })
  }

  const now = Date.now()
  const notifications: LocalNotificationSchema[] = []
  for (const t of tasks) {
    const occ = occurrences(t.due, t.tier).filter((x) => x > now).slice(0, 5)
    occ.forEach((at, i) => {
      notifications.push({
        id: hash(t.id) * 10 + i,
        title: TITLE[t.tier],
        body: t.title,
        schedule: { at: new Date(at), allowWhileIdle: true }
      })
    })
  }

  if (notifications.length) await LocalNotifications.schedule({ notifications })
}
