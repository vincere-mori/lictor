import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Task } from '../data/sample'
import { formatLeft, overdueClock } from '../lib/time'

export function TaskRow({ task }: { task: Task }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const delta = task.due - now
  const left = formatLeft(delta)

  return (
    <motion.div
      className={left.overdue ? 'row row-overdue' : 'row'}
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
    >
      <span className="row-bar" data-tier={task.tier} />
      <div className="row-body">
        <div className="row-title">{task.title}</div>
        <div className="row-meta" data-tier={task.tier}>
          {task.tier} · {left.text}
          {task.repeats ? <span className="row-rep"> ↻ ×{task.repeats}</span> : null}
        </div>
      </div>
      {left.overdue ? (
        <span className="row-count">{overdueClock(delta)}</span>
      ) : (
        <span className="row-box" data-tier={task.tier} />
      )}
    </motion.div>
  )
}
