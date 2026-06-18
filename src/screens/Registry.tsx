import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '../db'
import { TaskRow } from '../components/TaskRow'

export function Registry() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').sortBy('due'))

  if (!tasks) return null
  if (tasks.length === 0) {
    return <div className="empty">Пусто. Добавь задачу в строке снизу.</div>
  }

  return (
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
  )
}
