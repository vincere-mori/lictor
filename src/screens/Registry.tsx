import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '../db'
import { TaskRow } from '../components/TaskRow'
import { pickLine } from '../lib/quotes'

export function Registry() {
  const [view, setView] = useState<'active' | 'done'>('active')
  const active = useLiveQuery(() => db.tasks.where('status').equals('active').sortBy('due'))
  const done = useLiveQuery(async () =>
    (await db.tasks.where('status').equals('done').sortBy('completedAt')).reverse()
  )

  const now = Date.now()
  const ctx = !active || active.length === 0 ? 'empty' : active.some((t) => t.due <= now) ? 'overdue' : 'clear'
  const line = pickLine(ctx, Math.floor(now / 86_400_000))

  return (
    <>
      <div className="seg">
        <button className={view === 'active' ? 'on' : ''} onClick={() => setView('active')}>
          активные
        </button>
        <button className={view === 'done' ? 'on' : ''} onClick={() => setView('done')}>
          выполненные
        </button>
      </div>

      {view === 'active' ? (
        <>
          <div className="creed" data-ctx={ctx}>
            <span className="creed-text">{line.text}</span>
            {line.author ? <span className="creed-author">{line.author}</span> : null}
          </div>

          {!active ? null : active.length === 0 ? (
            <div className="empty">Пусто. Добавь задачу сверху.</div>
          ) : (
            <div className="list">
              <AnimatePresence initial={false}>
                {active.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <TaskRow task={t} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      ) : (
        <div className="list">
          {!done || done.length === 0 ? (
            <div className="empty">Пока ничего не выполнено.</div>
          ) : (
            done.map((t) => (
              <div className="done-row" key={t.id}>
                <span className="done-title">{t.title}</span>
                <button className="done-restore" onClick={() => db.tasks.update(t.id, { status: 'active' })}>
                  вернуть
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
