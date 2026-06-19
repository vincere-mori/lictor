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
    { text: 'Промедление - вот самая большая трата.', author: 'Сенека' },
    { text: 'Не действуй так, будто впереди десять тысяч лет.', author: 'Марк Аврелий' },
    { text: 'Делай, что должно, и будь, что будет.' },
    { text: 'Лучшее время - до того, как припрёт.' }
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
