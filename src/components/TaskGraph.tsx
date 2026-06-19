import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { db, type Group, type Task } from '../db'

const W = 320
const H = 300

type GNode = { id: string; label: string; kind: 'root' | 'group' | 'task'; tier?: string }
type GEdge = { from: string; to: string }
type Pos = Record<string, { x: number; y: number }>

const TIER_FILL: Record<string, string> = {
  MONEO: 'var(--t-moneo)',
  INSTO: 'var(--accent)',
  COGO: 'var(--danger)'
}

function ring(r: number, i: number, n: number, ox = W / 2, oy = H / 2) {
  const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2
  return { x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) }
}

function build(groups: Group[], tasks: Task[]) {
  const nodes: GNode[] = [{ id: 'root', label: 'Lictor', kind: 'root' }]
  const edges: GEdge[] = []
  const pos: Pos = { root: { x: W / 2, y: H / 2 } }

  const used = groups.filter((g) => tasks.some((t) => t.groupId === g.id))
  const ungrouped = tasks.filter((t) => !t.groupId || !used.some((g) => g.id === t.groupId))

  used.forEach((g, gi) => {
    nodes.push({ id: g.id, label: g.name, kind: 'group' })
    pos[g.id] = ring(108, gi, used.length)
    edges.push({ from: 'root', to: g.id })
    const gt = tasks.filter((t) => t.groupId === g.id)
    gt.forEach((t, ti) => {
      nodes.push({ id: t.id, label: t.title, kind: 'task', tier: t.tier })
      pos[t.id] = ring(42, ti, gt.length, pos[g.id].x, pos[g.id].y)
      edges.push({ from: g.id, to: t.id })
    })
  })

  ungrouped.forEach((t, ti) => {
    nodes.push({ id: t.id, label: t.title, kind: 'task', tier: t.tier })
    pos[t.id] = ring(60, ti, ungrouped.length)
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

  useEffect(() => {
    setPos(base.pos)
  }, [base])

  if (tasks.length === 0) {
    return <div className="graph-empty">Добавь задачи - здесь появятся связи групп.</div>
  }

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
    const p = toSvg(e)
    setPos((prev) => ({ ...prev, [drag.current as string]: p }))
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
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: 'var(--line-strong)' }} />
      })}
      {base.nodes.map((n) => {
        const p = pos[n.id]
        if (!p) return null
        const r = n.kind === 'root' ? 9 : n.kind === 'group' ? 7 : 5
        const fill = n.kind === 'root' ? 'var(--accent)' : n.kind === 'group' ? 'var(--surface)' : TIER_FILL[n.tier ?? ''] ?? 'var(--t-moneo)'
        const stroke = n.kind === 'group' ? 'var(--ink-dim)' : 'transparent'
        return (
          <g key={n.id} onPointerDown={(e) => down(n.id, e)} style={{ cursor: 'grab' }}>
            <circle cx={p.x} cy={p.y} r={r} style={{ fill, stroke, strokeWidth: 1.5 }} />
            {n.kind !== 'task' ? (
              <text x={p.x + r + 4} y={p.y + 4} fontSize="11" style={{ fontFamily: 'var(--mono)', fill: 'var(--ink)' }}>
                {n.label}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
