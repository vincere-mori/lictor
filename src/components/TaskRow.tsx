import { animate, motion, useMotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Task } from '../db'
import { completeTask, snoozeTask } from '../db'
import { formatLeft, overdueClock } from '../lib/time'
import { haptic } from '../lib/haptics'
import { useUI } from '../store'

export function TaskRow({ task }: { task: Task }) {
  const [now, setNow] = useState(() => Date.now())
  const x = useMotionValue(0)
  const setEditing = useUI((s) => s.setEditing)

  // адаптивный тикер: 1с когда близко/просрочено, иначе 30с - меньше ре-рендеров
  useEffect(() => {
    let id: number
    const tick = () => {
      setNow(Date.now())
      const d = task.due - Date.now()
      id = window.setTimeout(tick, d <= 120000 ? 1000 : 30000)
    }
    const d0 = task.due - Date.now()
    id = window.setTimeout(tick, d0 <= 120000 ? 1000 : 30000)
    return () => clearTimeout(id)
  }, [task.due])

  const delta = task.due - now
  const left = formatLeft(delta)

  function done() {
    haptic('medium')
    completeTask(task.id)
  }

  function settle() {
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 })
  }

  function handleEnd(offsetX: number) {
    if (offsetX > 90) {
      animate(x, 380, { duration: 0.18 })
      done()
    } else if (offsetX < -90) {
      haptic('light')
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
          {task.quote ? <div className="row-quote">{task.quote}</div> : null}
        </div>
        {left.overdue ? <span className="row-count">{overdueClock(delta)}</span> : null}
        <button
          className="row-box"
          data-tier={task.tier}
          aria-label="отметить выполненным"
          onClick={(e) => {
            e.stopPropagation()
            done()
          }}
        />
      </motion.div>
    </div>
  )
}
