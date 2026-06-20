import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { completeTask, db, snoozeTask } from '../db'
import { overdueClock } from '../lib/time'
import { pickLine } from '../lib/quotes'
import { haptic } from '../lib/haptics'
import { useNow } from '../clock'

export function AlarmOverlay() {
  const now = useNow()
  const [hold, setHold] = useState(0)
  const timer = useRef<number | null>(null)

  const cogos = useLiveQuery(
    () => db.tasks.where('status').equals('active').filter((t) => t.tier === 'COGO').toArray(),
    [],
    []
  )

  const task = cogos.filter((t) => t.due <= now).sort((a, b) => a.due - b.due)[0] ?? null

  if (!task) return null

  const line = task.quote ?? pickLine('alarm', task.due).text

  function stop() {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setHold(0)
  }

  function start() {
    const at = Date.now()
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - at) / 1200)
      setHold(p)
      if (p >= 1) {
        stop()
        snoozeTask(task!.id)
      }
    }, 30)
  }

  return (
    <motion.div className="alarm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="alarm-tier">COGO · БЕСПОЩАДНО</div>
      <div className="alarm-title">{task.title}</div>
      <div className="alarm-line">{line}</div>
      <div className="alarm-clock">{overdueClock(task.due - now)}</div>

      <div className="alarm-actions">
        <button
          className="alarm-done"
          onClick={() => {
            haptic('medium')
            completeTask(task.id)
          }}
        >
          Сделал
        </button>
        <button
          className="alarm-snooze"
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
        >
          <span className="alarm-snooze-fill" style={{ width: `${Math.round(hold * 100)}%` }} />
          <span className="alarm-snooze-label">держи: позже на 10 мин</span>
        </button>
      </div>
    </motion.div>
  )
}
