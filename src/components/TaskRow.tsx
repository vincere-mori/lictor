import { animate, motion, useMotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Task } from '../db'
import { completeTask, snoozeTask } from '../db'
import { formatLeft, overdueClock } from '../lib/time'
import { useUI } from '../store'

export function TaskRow({ task }: { task: Task }) {
  const [now, setNow] = useState(() => Date.now())
  const x = useMotionValue(0)
  const setEditing = useUI((s) => s.setEditing)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const delta = task.due - now
  const left = formatLeft(delta)

  function settle() {
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 })
  }

  function handleEnd(offsetX: number) {
    if (offsetX > 90) {
      animate(x, 380, { duration: 0.18 })
      completeTask(task.id)
    } else if (offsetX < -90) {
      snoozeTask(task.id)
      settle()
    } else {
      settle()
    }
  }

  return (
    <div className="rowwrap">
      <div className="rowaction left">готово</div>
      <div className="rowaction right">позже</div>
      <motion.div
        className={left.overdue ? 'row row-overdue' : 'row'}
        style={{ x, touchAction: 'pan-y' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragEnd={(_, info) => handleEnd(info.offset.x)}
      >
        <span className="row-bar" data-tier={task.tier} />
        <div className="row-body" onClick={() => setEditing(task.id)}>
          <div className="row-title">{task.title}</div>
          <div className="row-meta" data-tier={task.tier}>
            {task.tier} · {left.text}
            {task.snoozes ? <span className="row-rep"> ↻ ×{task.snoozes}</span> : null}
          </div>
        </div>
        {left.overdue ? <span className="row-count">{overdueClock(delta)}</span> : null}
        <button
          className="row-box"
          data-tier={task.tier}
          aria-label="отметить выполненным"
          onClick={(e) => {
            e.stopPropagation()
            completeTask(task.id)
          }}
        />
      </motion.div>
    </div>
  )
}
