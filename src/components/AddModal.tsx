import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { addTask, db } from '../db'
import { useUI } from '../store'
import type { Tier } from '../lib/time'

const TIERS: { id: Tier; hint: string }[] = [
  { id: 'MONEO', hint: 'тихо - один спокойный пинг' },
  { id: 'INSTO', hint: 'напор - повторы, тон жёстче' },
  { id: 'COGO', hint: 'беспощадно - full-screen алярм' }
]

export function AddModal() {
  const adding = useUI((s) => s.adding)
  const setAdding = useUI((s) => s.setAdding)
  const groups = useLiveQuery(() => db.groups.toArray(), [], [])
  const [text, setText] = useState('')
  const [tier, setTier] = useState<Tier>('INSTO')
  const [group, setGroup] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) {
      setText('')
      setTier('INSTO')
      setGroup('')
      const id = setTimeout(() => ref.current?.focus(), 60)
      return () => clearTimeout(id)
    }
  }, [adding])

  if (!adding) return null

  async function add() {
    const value = text.trim()
    if (!value) return
    await addTask(value, tier, group)
    setAdding(false)
  }

  return (
    <div className="modal-back" onClick={() => setAdding(false)}>
      <motion.div
        className="modal"
        initial={{ y: 16, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-h">НОВАЯ ЗАДАЧА</div>
        <input
          ref={ref}
          className="field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
          placeholder="что сделать? напр. «зал завтра 18:00»"
        />
        <div className="tiers">
          {TIERS.map((t) => (
            <button
              key={t.id}
              className={'tierbtn' + (tier === t.id ? ' on' : '')}
              data-tier={t.id}
              onClick={() => setTier(t.id)}
            >
              {t.id}
            </button>
          ))}
        </div>
        <div className="tier-hint">{TIERS.find((t) => t.id === tier)?.hint}</div>
        <input
          className="field"
          list="add-groups"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="группа (необязательно), напр. Тренировка"
        />
        <datalist id="add-groups">
          {groups.map((g) => (
            <option key={g.id} value={g.name} />
          ))}
        </datalist>
        <button className="btn" onClick={add}>
          Добавить
        </button>
      </motion.div>
    </div>
  )
}
