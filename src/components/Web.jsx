import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { tieLabel } from '../lore.js'

const W = 920
const H = 640
const PAD = 70

// Fruchterman-Reingold with a generous ideal distance, seeded from a circle
// so the same web always settles the same way. Repulsion k^2/d, attraction
// d^2/k along ties, a whisper of gravity so islands stay in frame.
function layout (nodes, edges) {
  const n = nodes.length
  if (n === 0) return []
  const idx = new Map(nodes.map((node, i) => [node.id, i]))
  const pos = nodes.map((_, i) => {
    const a = (2 * Math.PI * i) / n
    return { x: W / 2 + 220 * Math.cos(a), y: H / 2 + 190 * Math.sin(a) }
  })
  const springs = edges
    .map(e => [idx.get(e.a), idx.get(e.b)])
    .filter(([a, b]) => a !== undefined && b !== undefined && a !== b)

  const area = (W - 2 * PAD) * (H - 2 * PAD)
  const k = Math.min(300, Math.max(150, Math.sqrt(area / n) * 0.7))
  const ITER = 300

  for (let iter = 0; iter < ITER; iter++) {
    const heat = Math.max(2, (W / 8) * (1 - iter / ITER))
    const force = pos.map(() => ({ x: 0, y: 0 }))
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = pos[i].x - pos[j].x
        let dy = pos[i].y - pos[j].y
        let d = Math.sqrt(dx * dx + dy * dy)
        if (d < 1) { dx = ((i - j) % 7) || 1; dy = 1; d = Math.sqrt(dx * dx + dy * dy) }
        const rep = (k * k) / d
        force[i].x += (dx / d) * rep
        force[i].y += (dy / d) * rep
        force[j].x -= (dx / d) * rep
        force[j].y -= (dy / d) * rep
      }
    }
    for (const [a, b] of springs) {
      const dx = pos[a].x - pos[b].x
      const dy = pos[a].y - pos[b].y
      const d = Math.sqrt(dx * dx + dy * dy) || 1
      const att = (d * d) / k
      force[a].x -= (dx / d) * att
      force[a].y -= (dy / d) * att
      force[b].x += (dx / d) * att
      force[b].y += (dy / d) * att
    }
    for (let i = 0; i < n; i++) {
      force[i].x += (W / 2 - pos[i].x) * 0.03
      force[i].y += (H / 2 - pos[i].y) * 0.03
      const f = Math.sqrt(force[i].x ** 2 + force[i].y ** 2) || 0.1
      const step = Math.min(f, heat)
      pos[i].x += (force[i].x / f) * step
      pos[i].y += (force[i].y / f) * step
      pos[i].x = Math.max(PAD, Math.min(W - PAD, pos[i].x))
      pos[i].y = Math.max(PAD, Math.min(H - PAD, pos[i].y))
    }
  }
  return pos
}

function buildEdges (db) {
  const edges = []
  const seen = new Set()
  const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`)

  for (const p of db.people) {
    for (const t of p.ties || []) {
      const k = key(p.id, t.personId) + '|' + t.kind
      if (seen.has(k) || p.id === t.personId) continue
      seen.add(k)
      edges.push({ a: p.id, b: t.personId, kind: t.kind, note: t.note, strong: true })
    }
  }
  for (const e of db.journal) {
    const ids = e.personIds || []
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const k = key(ids[i], ids[j]) + '|mention'
        if (seen.has(k)) continue
        seen.add(k)
        edges.push({ a: ids[i], b: ids[j], kind: 'mention', note: e.title || 'named together', strong: false })
      }
    }
  }
  return edges
}

export default function Web () {
  const { db } = useData()
  const [hover, setHover] = useState(null)

  const { nodes, edges, positions, underGlass } = useMemo(() => {
    const nodes = db.people
    const edges = buildEdges(db).filter(e =>
      nodes.some(n => n.id === e.a) && nodes.some(n => n.id === e.b))
    const positions = layout(nodes, edges)
    const underGlass = new Set(db.cases.filter(c => c.status === 'open').map(c => c.personId))
    return { nodes, edges, positions, underGlass }
  }, [db])

  const posOf = useMemo(() => {
    const m = new Map()
    nodes.forEach((n, i) => m.set(n.id, positions[i]))
    return m
  }, [nodes, positions])

  const neighbors = useMemo(() => {
    const m = new Map()
    for (const e of edges) {
      if (!m.has(e.a)) m.set(e.a, new Set())
      if (!m.has(e.b)) m.set(e.b, new Set())
      m.get(e.a).add(e.b)
      m.get(e.b).add(e.a)
    }
    return m
  }, [edges])

  const isDim = (id) => hover && id !== hover && !(neighbors.get(hover)?.has(id))

  if (nodes.length < 2) {
    return (
      <section>
        <header className="page-head">
          <h1>The Web</h1>
          <p className="page-sub">Every thread between every name. Pull one and see what trembles.</p>
        </header>
        <p className="empty">
          The web needs at least two names in the ledger.
          {nodes.length === 0 ? ' It has none.' : ' It has one, and a web of one thread catches nothing.'}
        </p>
      </section>
    )
  }

  return (
    <section>
      <header className="page-head">
        <h1>The Web</h1>
        <p className="page-sub">
          Every thread between every name. Ties are drawn in their color, shared journal pages as faint thread,
          and a red ring marks an open case.
        </p>
      </header>

      <div className="web-frame">
        <svg className="web-svg" viewBox={`0 0 ${W} ${H}`} onMouseLeave={() => setHover(null)}>
          {edges.map((e, i) => {
            const pa = posOf.get(e.a)
            const pb = posOf.get(e.b)
            if (!pa || !pb) return null
            const mx = (pa.x + pb.x) / 2 + (pa.y - pb.y) * 0.12
            const my = (pa.y + pb.y) / 2 + (pb.x - pa.x) * 0.12
            const dim = hover && !(hover === e.a || hover === e.b)
            return (
              <path
                key={i}
                d={`M${pa.x},${pa.y} Q${mx},${my} ${pb.x},${pb.y}`}
                className={`web-edge edge-${e.kind}` + (e.strong ? '' : ' faint') + (dim ? ' dim' : '')}
              >
                <title>{e.strong ? `${tieLabel(e.kind)}${e.note ? `: ${e.note}` : ''}` : `Named together: ${e.note}`}</title>
              </path>
            )
          })}
          {nodes.map((p, i) => {
            const pos = positions[i]
            return (
              <g
                key={p.id}
                className={'web-node' + (isDim(p.id) ? ' dim' : '')}
                transform={`translate(${pos.x},${pos.y})`}
                onMouseEnter={() => setHover(p.id)}
                onClick={() => { window.location.hash = `#/person/${p.id}` }}
              >
                {underGlass.has(p.id) && <circle r="33" className="web-glass" />}
                <circle r="26" className="web-disc" />
                <text className="web-initial" dy="7">{p.name[0]}</text>
                <text className="web-name" y="46">{p.name.split(' ')[0]}</text>
                <title>{p.name}{p.role ? `, ${p.role}` : ''}{underGlass.has(p.id) ? ' · under the glass' : ''}</title>
              </g>
            )
          })}
        </svg>
      </div>

      <p className="web-legend">
        Add ties from a person&apos;s page in the ledger. Hover a name to see who stands near them.
      </p>
    </section>
  )
}
