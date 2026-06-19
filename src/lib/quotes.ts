import type { Tier } from './time'

export type LineCtx = 'empty' | 'clear' | 'overdue' | 'alarm' | 'done'

export interface Line {
  text: string
  author?: string
}

const LINES: Record<LineCtx, Line[]> = {
  empty: [
    { text: 'Пока мы откладываем жизнь, она проходит.', author: 'Сенека' },
    { text: 'Пустой список - не свобода, а пауза. Заполни его волей.' },
    { text: 'Каждый новый день - новая жизнь. Реши, на что её тратишь.', author: 'Сенека' }
  ],
  clear: [
    { text: 'Лучшее время - сейчас.' },
    { text: 'Промедление - самая большая трата времени.', author: 'Сенека' },
    { text: 'Не действуй так, будто впереди десять тысяч лет.', author: 'Марк Аврелий' },
    { text: 'Делай, что должно, и будь, что будет.' },
    { text: 'Сегодня - единственный день, который у тебя есть.' }
  ],
  overdue: [
    { text: 'Periculum in mora. В промедлении - опасность.', author: 'Тит Ливий' },
    { text: 'Срок прошёл. Это решаешь не ты, а часы.' },
    { text: 'Оправдания не закрывают задачи.' },
    { text: 'Ты дал слово. Долг не исчез.' }
  ],
  alarm: [
    { text: 'Хватит. Встал и сделал.' },
    { text: 'Это не подождёт. И ты - тоже.' },
    { text: 'Секунда промедления - тоже выбор. Выбери верно.' }
  ],
  done: [
    { text: 'Сделано. Дальше.' },
    { text: 'Так держат слово.' },
    { text: 'Минус один. Не сбавляй.' },
    { text: 'Долг закрыт. Дисциплина растёт.' }
  ]
}

export function pickLine(ctx: LineCtx, seed: number): Line {
  const arr = LINES[ctx]
  return arr[Math.abs(Math.floor(seed)) % arr.length]
}

// личная строка задачи по её тиру (закрепляется при создании)
const TASK_LINES: Record<Tier, string[]> = {
  MONEO: ['Спокойно, но не забудь.', 'Маленький шаг - тоже шаг.', 'Сделай в своё время, но сделай.'],
  INSTO: ['Не тяни - и не придётся бежать.', 'Сделай, пока это легко.', 'Чем раньше начнёшь, тем меньше давит.'],
  COGO: ['Без вариантов. Только вперёд.', 'Это не обсуждается - делай.', 'Срыв не входит в план.']
}

export function quoteForTask(tier: Tier, seed: number): string {
  const arr = TASK_LINES[tier]
  return arr[Math.abs(Math.floor(seed)) % arr.length]
}
