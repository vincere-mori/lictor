import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { db, type Group, type Task } from '../db'

const W = 320
const H = 320

type Kind = 'root' | 'group' | 'task'
type GNode = { id: string; label: string; kind: Kind; tier?: string; r: number }
type GEdge = { from: string; to: string }
type Pos = Record<string, { x: number; y: number }>

const TIER_FILL: Record<string, string> = {
  MONEO: 'var(--t-moneo)',
  INSTO: 'var(--accent)',
  COGO: 'var(--danger)'
}

function ring(r: number, i: number, n: number, ox: number, oy: number, phase = -Math.PI / 2) {
  const a = (i / Math.max(1, n)) * Math.PI * 2 + phase
  return { x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) }
}

function short(s: string, n = 12) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function build(groups: Group[], tasks: Task[]) {
  const nodes: GNode[] = [{ id: 'root', label: 'Lictor', kind: 'root', r: 12 }]
  const edges: GEdge[] = []
  const pos: Pos = { root: { x: W / 2, y: H / 2 } }

  const used = groups.filter((g) => tasks.some((t) => t.groupId === g.id))
  const ungrouped = tasks.filter((t) => !t.groupId || !used.some((g) => g.id === t.groupId))

  used.forEach((g, gi) => {
    const gt = tasks.filter((t) => t.groupId === g.id)
    nodes.push({ id: g.id, label: g.name, kind: 'group', r: Math.min(15, 8 + gt.length) })
    pos[g.id] = used.length === 1 ? { x: W / 2, y: H / 2 - 78 } : ring(112, gi, used.length, W / 2, H / 2)
    edges.push({ from: 'root', to: g.id })
    gt.forEach((t, ti) => {
      nodes.push({ id: t.id, label: t.title, kind: 'task', tier: t.tier, r: 6 })
      pos[t.id] = ring(46, ti, gt.length, pos[g.id].x, pos[g.id].y, gi + 0.6)
      edges.push({ from: g.id, to: t.id })
    })
  })

  ungrouped.forEach((t, ti) => {
    nodes.push({ id: t.id, label: t.title, kind: 'task', tier: t.tier, r: 6 })
    pos[t.id] = ring(70, ti, ungrouped.length, W / 2, H / 2)
    edges.push({ from: 'root', to: t.id })
  })

  return { nodes, edges, pos }
}

export function TaskGraph() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').toArray(), [], [])
  const groups = useLiveQuery(() => db.groups.toArray(), [], [])
  const base = useMemo(() => build(groups, tasks), [groups, tasks])
  const [pos, setPos] = useState<Pos>(base.pos)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<string | null>(null)

  useEffect(() => setPos(base.pos), [base])

  if (tasks.length === 0) return <div className="graph-empty">Добавь задачи - здесь появятся связи групп.</div>

  function toSvg(e: RPointerEvent) {
    const r = svgRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }
  function down(id: string, e: RPointerEvent) {
    drag.current = id
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  function move(e: RPointerEvent) {
    if (!drag.current) return
    setPos((p) => ({ ...p, [drag.current as string]: toSvg(e) }))
  }
  function up() {
    drag.current = null
  }

  return (
    <svg ref={svgRef} className="graph-svg" viewBox={`0 0 ${W} ${H}`} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
      {base.edges.map((e, i) => {
        const a = pos[e.from]
        const b = pos[e.to]
        if (!a || !b) return null
        const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.12
        const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.12
        return (
          <motion.path
            key={i}
            d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`}
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ stroke: 'var(--line-strong)', strokeWidth: 1 }}
          />
        )
      })}
      {base.nodes.map((n, i) => {
        const p = pos[n.id]
        if (!p) return null
        const fill =
          n.kind === 'root' ? 'var(--accent)' : n.kind === 'group' ? 'var(--surface)' : TIER_FILL[n.tier ?? ''] ?? 'var(--t-moneo)'
        const stroke = n.kind === 'group' ? 'var(--accent)' : 'transparent'
        return (
          <motion.g
            key={n.id}
            onPointerDown={(e) => down(n.id, e)}
            style={{ cursor: 'grab' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: Math.min(0.45, i * 0.03) }}
          >
            <circle cx={p.x} cy={p.y} r={n.r} style={{ fill, stroke, strokeWidth: 2 }} />
            {n.kind === 'task' ? (
              <text x={p.x} y={p.y + n.r + 11} textAnchor="middle" fontSize="9.5" style={{ fontFamily: 'var(--mono)', fill: 'var(--ink-dim)' }}>
                {short(n.label)}
              </text>
            ) : (
              <text x={p.x + n.r + 5} y={p.y + 4} fontSize="11.5" style={{ fontFamily: 'var(--mono)', fill: 'var(--ink)' }}>
                {n.label}
              </text>
            )}
          </motion.g>
        )
      })}
    </svg>
  )
}
