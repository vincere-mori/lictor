import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { db } from '../db'
import { pickLine } from '../lib/quotes'

// короткая похвала снизу при выполнении задачи
export function Praise() {
  const last = useLiveQuery(() => db.events.where('type').equals('done').last(), [], undefined)
  const [text, setText] = useState<string | null>(null)
  const mountTs = useRef(Date.now())
  const shownTs = useRef(0)

  useEffect(() => {
    if (!last || last.ts <= mountTs.current || last.ts === shownTs.current) return
    shownTs.current = last.ts
    setText(pickLine('done', last.ts).text)
    const id = setTimeout(() => setText(null), 2600)
    return () => clearTimeout(id)
  }, [last])

  return (
    <div className="praise-wrap">
      <AnimatePresence>
        {text ? (
          <motion.div
            className="praise-pill"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            {text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
