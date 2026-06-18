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
  return Math.abs(h) % 100000
}

async function ensureChannels() {
  await LocalNotifications.createChannel({ id: 'moneo', name: 'MONEO', description: 'Тихие напоминания', importance: 3, visibility: 1 })
  await LocalNotifications.createChannel({ id: 'insto', name: 'INSTO', description: 'Настойчивые', importance: 4, vibration: true, visibility: 1 })
  await LocalNotifications.createChannel({ id: 'cogo', name: 'COGO', description: 'Беспощадные', importance: 5, vibration: true, visibility: 1 })
}

// пересобрать все локальные уведомления под текущие активные задачи
export async function rescheduleNative(tasks: Task[]) {
  const perm = await LocalNotifications.checkPermissions()
  if (perm.display !== 'granted') {
    const req = await LocalNotifications.requestPermissions()
    if (req.display !== 'granted') return
  }

  await ensureChannels()

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
        channelId: t.tier.toLowerCase(),
        schedule: { at: new Date(at), allowWhileIdle: true }
      })
    })
  }

  if (notifications.length) await LocalNotifications.schedule({ notifications })
}
