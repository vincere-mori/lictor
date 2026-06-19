import Dexie, { type Table } from 'dexie'
import type { Tier } from './lib/time'
import { parseInput } from './lib/parse'
import { bestHour, hourlyResponse } from './lib/brain'
import { quoteForTask } from './lib/quotes'

export type TaskStatus = 'active' | 'done'

export interface Task {
  id: string
  title: string
  tier: Tier
  due: number
  status: TaskStatus
  createdAt: number
  completedAt?: number
  snoozes: number
  quote?: string
}

export interface TaskEvent {
  id?: number
  taskId: string
  type: 'created' | 'done' | 'snoozed' | 'fired'
  tier: Tier
  ts: number
}

class LictorDB extends Dexie {
  tasks!: Table<Task, string>
  events!: Table<TaskEvent, number>

  constructor() {
    super('lictor')
    this.version(1).stores({
      tasks: 'id, status, due',
      events: '++id, taskId, type, ts'
    })
  }
}

export const db = new LictorDB()

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export async function addTask(text: string, tier?: Tier, now = Date.now()) {
  const parsed = parseInput(text, now)
  if (!parsed) return
  const finalTier = tier ?? parsed.tier

  let due = parsed.due
  if (!parsed.explicitTime && parsed.daySet) {
    const events = await db.events.toArray()
    const d = new Date(parsed.due)
    d.setHours(bestHour(hourlyResponse(events)), 0, 0, 0)
    due = d.getTime()
  }

  const task: Task = {
    id: uid(),
    title: parsed.title,
    tier: finalTier,
    due,
    status: 'active',
    createdAt: now,
    snoozes: 0,
    quote: quoteForTask(finalTier, now)
  }
  await db.tasks.add(task)
  await db.events.add({ taskId: task.id, type: 'created', tier: finalTier, ts: now })
  return task
}

export async function completeTask(id: string, now = Date.now()) {
  const t = await db.tasks.get(id)
  if (!t || t.status === 'done') return
  await db.tasks.update(id, { status: 'done', completedAt: now })
  await db.events.add({ taskId: id, type: 'done', tier: t.tier, ts: now })
}

export async function snoozeTask(id: string, minutes = 10, now = Date.now()) {
  const t = await db.tasks.get(id)
  if (!t) return
  const base = Math.max(t.due, now)
  await db.tasks.update(id, { due: base + minutes * 60000, snoozes: t.snoozes + 1 })
  await db.events.add({ taskId: id, type: 'snoozed', tier: t.tier, ts: now })
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id)
}

let seeding = false

const seed: () => Task[] = () => {
  const now = Date.now()
  return [
    { id: uid(), title: 'Прочитать 20 страниц', tier: 'MONEO', due: now + 7 * 3600e3, status: 'active', createdAt: now, snoozes: 0, quote: quoteForTask('MONEO', now) },
    { id: uid(), title: 'Позвонить в деканат', tier: 'INSTO', due: now + 25 * 60e3, status: 'active', createdAt: now, snoozes: 0, quote: quoteForTask('INSTO', now + 1) },
    { id: uid(), title: 'Сдать лабу ИТМО', tier: 'COGO', due: now - (12 * 60e3 + 24e3), status: 'active', createdAt: now, snoozes: 0, quote: quoteForTask('COGO', now + 2) }
  ]
}

export async function seedIfEmpty() {
  if (seeding) return
  seeding = true
  const count = await db.tasks.count()
  if (count === 0) await db.tasks.bulkAdd(seed())
}
