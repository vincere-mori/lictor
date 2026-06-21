import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useReducer, useRef } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { db, type Group, type Task } from '../db'

const W = 320
const H = 320

const TIER_FILL: Record<string, string> = {
  MONEO: 'var(--t-moneo)',
  INSTO: 'var(--accent)',
  COGO: 'var(--danger)'
}

type Node = {
  id: string
  kind: 'group' | 'task'
  label: string
  tier?: string
  r: number
  x: number
  y: number
  vx: number
  vy: number
  fx: number | null
  fy: number | null
}
type Edge = { a: string; b: string }

function short(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function buildModel(groups: Group[], tasks: Task[], prev: Map<string, Node>) {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const used = groups.filter((g) => tasks.some((t) => t.groupId === g.id))

  const make = (id: string, base: { x: number; y: number }, kind: 'group' | 'task', label: string, r: number, tier?: string): Node => {
    const p = prev.get(id)
    return { id, kind, label, tier, r, x: p?.x ?? base.x, y: p?.y ?? base.y, vx: p?.vx ?? 0, vy: p?.vy ?? 0, fx: null, fy: null }
  }

  used.forEach((g, gi) => {
    const gt = tasks.filter((t) => t.groupId === g.id)
    const ang = (gi / used.length) * Math.PI * 2
    const hub = { x: W / 2 + Math.cos(ang) * 60, y: H / 2 + Math.sin(ang) * 60 }
    nodes.push(make(g.id, hub, 'group', g.name, Math.min(15, 9 + gt.length)))
    gt.forEach((t, ti) => {
      const a2 = ang + (ti - gt.length / 2) * 0.5
      nodes.push(make(t.id, { x: hub.x + Math.cos(a2) * 40, y: hub.y + Math.sin(a2) * 40 }, 'task', t.title, 6, t.tier))
      edges.push({ a: g.id, b: t.id })
    })
  })

  const ungrouped = tasks.filter((t) => !t.groupId || !used.some((g) => g.id === t.groupId))
  ungrouped.forEach((t, ti) => {
    const a = (ti / Math.max(1, ungrouped.length)) * Math.PI * 2
    nodes.push(make(t.id, { x: W / 2 + Math.cos(a) * 92, y: H / 2 + Math.sin(a) * 92 }, 'task', t.title, 6, t.tier))
  })

  return { nodes, edges }
}

export function TaskGraph() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').toArray(), [], [])
  const groups = useLiveQuery(() => db.groups.toArray(), [], [])

  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const byId = useRef<Map<string, Node>>(new Map())
  const adj = useRef<Map<string, Set<string>>>(new Map())
  const alpha = useRef(0)
  const raf = useRef<number | null>(null)
  const dragId = useRef<string | null>(null)
  const activeId = useRef<string | null>(null) // наведённый узел
  const svgRef = useRef<SVGSVGElement>(null)
  const [, render] = useReducer((c: number) => c + 1, 0)

  function step(a: number) {
    const ns = nodesRef.current
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        let dx = ns[i].x - ns[j].x
        let dy = ns[i].y - ns[j].y
        let d2 = dx * dx + dy * dy
        if (d2 < 1) {
          d2 = 1
          dx = Math.random() - 0.5
          dy = Math.random() - 0.5
        }
        const d = Math.sqrt(d2)
        const f = (1600 * a) / d2
        const ux = dx / d
        const uy = dy / d
        ns[i].vx += ux * f
        ns[i].vy += uy * f
        ns[j].vx -= ux * f
        ns[j].vy -= uy * f
      }
    }
    for (const e of edgesRef.current) {
      const A = byId.current.get(e.a)
      const B = byId.current.get(e.b)
      if (!A || !B) continue
      const dx = B.x - A.x
      const dy = B.y - A.y
      const d = Math.hypot(dx, dy) || 1
      const f = (d - 54) * 0.05 * a
      const ux = dx / d
      const uy = dy / d
      A.vx += ux * f
      A.vy += uy * f
      B.vx -= ux * f
      B.vy -= uy * f
    }
    for (const n of ns) {
      if (n.fx != null) {
        n.x = n.fx
        n.y = n.fy as number
        n.vx = 0
        n.vy = 0
        continue
      }
      n.vx += (W / 2 - n.x) * 0.015 * a
      n.vy += (H / 2 - n.y) * 0.015 * a
      n.vx *= 0.82
      n.vy *= 0.82
      n.x += n.vx
      n.y += n.vy
      n.x = Math.max(12, Math.min(W - 12, n.x))
      n.y = Math.max(16, Math.min(H - 16, n.y))
    }
  }

  function frame() {
    alpha.current *= 0.97
    step(alpha.current)
    render()
    if (alpha.current > 0.02 || dragId.current) raf.current = requestAnimationFrame(frame)
    else raf.current = null
  }

  function reheat() {
    alpha.current = Math.max(alpha.current, 0.6)
    if (raf.current == null) raf.current = requestAnimationFrame(frame)
  }

  useEffect(() => {
    const prev = new Map(nodesRef.current.map((n) => [n.id, n] as const))
    const m = buildModel(groups, tasks, prev)
    nodesRef.current = m.nodes
    edgesRef.current = m.edges
    byId.current = new Map(m.nodes.map((n) => [n.id, n] as const))
    const a = new Map<string, Set<string>>()
    for (const n of m.nodes) a.set(n.id, new Set())
    for (const e of m.edges) {
      a.get(e.a)?.add(e.b)
      a.get(e.b)?.add(e.a)
    }
    adj.current = a
    if (activeId.current && !byId.current.has(activeId.current)) activeId.current = null
    reheat()
    render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, tasks])

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current) }, [])

  if (tasks.length === 0) return <div className="graph-empty">Добавь задачи - здесь появятся связи групп.</div>

  function setActive(id: string | null) {
    activeId.current = id
    render()
  }

  function toSvg(e: RPointerEvent) {
    const r = svgRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }
  function down(id: string, e: RPointerEvent) {
    const n = byId.current.get(id)
    if (!n) return
    n.fx = n.x
    n.fy = n.y
    dragId.current = id
    setActive(id)
    ;(e.target as Element).setPointerCapture(e.pointerId)
    reheat()
  }
  function move(e: RPointerEvent) {
    if (!dragId.current) return
    const n = byId.current.get(dragId.current)
    if (!n) return
    const p = toSvg(e)
    n.fx = p.x
    n.fy = p.y
    reheat()
  }
  function leave() {
    up()
    if (!dragId.current) setActive(null)
  }
  function up() {
    const id = dragId.current
    if (id) {
      const n = byId.current.get(id)
      if (n) {
        n.fx = null
        n.fy = null
      }
    }
    dragId.current = null
  }

  const act = activeId.current
  const near = act ? adj.current.get(act) ?? new Set<string>() : null
  const lit = (id: string) => !act || id === act || (near?.has(id) ?? false)

  return (
    <svg
      ref={svgRef}
      className="graph-svg"
      viewBox={`0 0 ${W} ${H}`}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={leave}
    >
      <defs>
        <filter id="neuron-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {edgesRef.current.map((e, i) => {
        const A = byId.current.get(e.a)
        const B = byId.current.get(e.b)
        if (!A || !B) return null
        const on = act && (e.a === act || e.b === act)
        return (
          <line
            key={i}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            style={{
              stroke: on ? 'var(--accent)' : 'var(--line-strong)',
              strokeWidth: on ? 1.4 : 1,
              opacity: act ? (on ? 0.9 : 0.12) : 0.4,
              transition: 'opacity .2s, stroke .2s'
            }}
          />
        )
      })}

      {nodesRef.current.map((n) => {
        const fill = n.kind === 'group' ? 'var(--accent)' : TIER_FILL[n.tier ?? ''] ?? 'var(--t-moneo)'
        const on = act === n.id
        const dim = lit(n.id) ? 1 : 0.22
        return (
          <g
            key={n.id}
            onPointerDown={(e) => down(n.id, e)}
            onPointerEnter={() => !dragId.current && setActive(n.id)}
            style={{ cursor: 'grab', opacity: dim, transition: 'opacity .2s' }}
          >
            {on && (
              <circle cx={n.x} cy={n.y} r={n.r + 5} style={{ fill: 'none', stroke: fill, strokeWidth: 1.4, opacity: 0.5 }}>
                <animate attributeName="r" values={`${n.r + 3};${n.r + 8};${n.r + 3}`} dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.55;0.1;0.55" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={n.x} cy={n.y} r={n.r} style={{ fill, filter: 'url(#neuron-glow)' }} />
            <circle cx={n.x} cy={n.y} r={n.r} style={{ fill, opacity: n.kind === 'group' ? 1 : 0.92 }} />
            {(act ? lit(n.id) : n.kind === 'group') && (
              <text
                x={n.x}
                y={n.y + n.r + (n.kind === 'group' ? 12 : 10)}
                textAnchor="middle"
                fontSize={n.kind === 'group' ? '11' : '9.5'}
                style={{ fontFamily: 'var(--mono)', fill: n.kind === 'group' ? 'var(--ink)' : 'var(--ink-dim)', pointerEvents: 'none' }}
              >
                {short(n.label, n.kind === 'group' ? 14 : 11)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
