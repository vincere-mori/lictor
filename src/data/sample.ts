import type { Tier } from '../lib/time'

export type Task = {
  id: string
  title: string
  tier: Tier
  due: number
  repeats?: number
}

const now = Date.now()

export const sampleTasks: Task[] = [
  { id: '1', title: 'Прочитать 20 страниц', tier: 'MONEO', due: now + 7 * 3600e3 },
  { id: '2', title: 'Позвонить в деканат', tier: 'INSTO', due: now + 25 * 60e3, repeats: 3 },
  { id: '3', title: 'Сдать лабу ИТМО', tier: 'COGO', due: now - (12 * 60e3 + 24e3) }
]
