import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { db, deleteTask, ensureGroup } from '../db'
import { useUI } from '../store'
import type { Tier } from '../lib/time'

const TIERS: Tier[] = ['MONEO', 'INSTO', 'COGO']

function toLocalInput(ms: number) {
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}

export function EditSheet() {
  const editingId = useUI((s) => s.editingId)
  const setEditing = useUI((s) => s.setEditing)
  const task = useLiveQuery(() => (editingId ? db.tasks.get(editingId) : undefined), [editingId])
  const groups = useLiveQuery(() => db.groups.toArray(), [], [])

  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [tier, setTier] = useState<Tier>('INSTO')
  const [group, setGroup] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setWhen(toLocalInput(task.due))
      setTier(task.tier)
      setGroup(task.groupId ? (groups.find((g) => g.id === task.groupId)?.name ?? '') : '')
    }
  }, [task, groups])

  if (!editingId) return null

  async function save() {
    if (!task) return
    const due = when ? new Date(when).getTime() : task.due
    const groupId = await ensureGroup(group)
    await db.tasks.update(task.id, { title: title.trim() || task.title, due, tier, groupId })
    setEditing(null)
  }

  async function remove() {
    if (!task) return
    await deleteTask(task.id)
    setEditing(null)
  }

  return (
    <div className="sheet-back" onClick={() => setEditing(null)}>
      <motion.div
        className="sheet"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-h">ЗАДАЧА</div>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="название" />
        <input className="field" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <input
          className="field"
          list="edit-groups"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="группа (необязательно)"
        />
        <datalist id="edit-groups">
          {groups.map((g) => (
            <option key={g.id} value={g.name} />
          ))}
        </datalist>
        <div className="tiers">
          {TIERS.map((t) => (
            <button
              key={t}
              className={'tierbtn' + (tier === t ? ' on' : '')}
              data-tier={t}
              onClick={() => setTier(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="sheet-actions">
          <button className="btn" onClick={save}>
            Сохранить
          </button>
          <button className="btn-ghost" onClick={remove}>
            Удалить
          </button>
        </div>
      </motion.div>
    </div>
  )
}
