import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { completeTask, db, snoozeTask } from '../db'
import { overdueClock } from '../lib/time'
import { pickLine } from '../lib/quotes'

export function AlarmOverlay() {
  const [now, setNow] = useState(() => Date.now())
  const [hold, setHold] = useState(0)
  const timer = useRef<number | null>(null)

  const task = useLiveQuery(async () => {
    const active = await db.tasks.where('status').equals('active').toArray()
    const t = Date.now()
    return active.filter((x) => x.tier === 'COGO' && x.due <= t).sort((a, b) => a.due - b.due)[0] ?? null
  })

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!task) return null

  const line = pickLine('alarm', task.due)

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
      <div className="alarm-line">{line.text}</div>
      <div className="alarm-clock">{overdueClock(task.due - now)}</div>

      <div className="alarm-actions">
        <button className="alarm-done" onClick={() => completeTask(task.id)}>
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
