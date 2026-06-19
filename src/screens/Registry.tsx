import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '../db'
import { TaskRow } from '../components/TaskRow'
import { pickLine } from '../lib/quotes'

export function Registry() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').sortBy('due'))
  if (!tasks) return null

  const now = Date.now()
  const ctx = tasks.length === 0 ? 'empty' : tasks.some((t) => t.due <= now) ? 'overdue' : 'clear'
  const line = pickLine(ctx, Math.floor(now / 86_400_000))

  return (
    <>
      <div className="creed" data-ctx={ctx}>
        <span className="creed-text">{line.text}</span>
        {line.author ? <span className="creed-author">{line.author}</span> : null}
      </div>

      {tasks.length === 0 ? (
        <div className="empty">Пусто. Добавь задачу в строке снизу.</div>
      ) : (
        <div className="list">
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
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
  )
}
