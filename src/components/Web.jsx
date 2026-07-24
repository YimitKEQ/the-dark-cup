import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { tieLabel, formatWorldDate, todayWorldDate } from '../lore.js'
import ParchmentModal from './ParchmentModal.jsx'

// The same web, drawn in iron-gall ink for the parchment export.
const INK = {
  kin: '#4c5f33',
  ally: '#35566b',
  rival: '#7a5a1c',
  enemy: '#7c2f1d',
  debt: '#6e531d',
  informant: '#533f6e',
  patron: '#8a6a1e',
  mention: 'rgba(58, 40, 18, 0.3)'
}

function WebInk ({ nodes, edges, positions, underGlass }) {
  const posOf = new Map(nodes.map((n, i) => [n.id, positions[i]]))
  return (
    <svg className="web-ink" viewBox={`0 0 ${W} ${H}`}>
      {edges.map((e, i) => {
        const pa = posOf.get(e.a)
        const pb = posOf.get(e.b)
        if (!pa || !pb) return null
        const mx = (pa.x + pb.x) / 2 + (pa.y - pb.y) * 0.12
        const my = (pa.y + pb.y) / 2 + (pb.x - pa.x) * 0.12
        const dashed = e.kind === 'rival' || e.kind === 'enemy'
        return (
          <path
            key={i}
            d={`M${pa.x},${pa.y} Q${mx},${my} ${pb.x},${pb.y}`}
            fill="none"
            stroke={INK[e.kind] || INK.mention}
            strokeWidth={e.strong ? 1.8 : 1}
            strokeDasharray={dashed ? '7 4' : 'none'}
          />
        )
      })}
      {nodes.map((p, i) => {
        const pos = positions[i]
        return (
          <g key={p.id} transform={`translate(${pos.x},${pos.y})`}>
            {underGlass.has(p.id) && (
              <circle r="33" fill="none" stroke="#7c2f1d" strokeWidth="1.6" strokeDasharray="4 4" />
            )}
            <circle r="26" fill="rgba(233, 214, 168, 0.6)" stroke="#3a2a14" strokeWidth="1.4" />
            <text dy="8" textAnchor="middle" fontFamily="IM Fell English" fontSize="26" fill="#5a2416">{p.name[0]}</text>
            <text y="48" textAnchor="middle" fontFamily="IM Fell English SC" fontSize="15" fill="#3a2a14">{p.name.split(' ')[0]}</text>
          </g>
        )
      })}
    </svg>
  )
}

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
    const a = (2 * Math.PI * i) / n + (i % 2) * 0.5
    const r = 150 + (i % 3) * 45
    return { x: W / 2 + r * Math.cos(a), y: H / 2 + r * 0.8 * Math.sin(a) }
  })
  const springs = edges
    .map(e => [idx.get(e.a), idx.get(e.b)])
    .filter(([a, b]) => a !== undefined && b !== undefined && a !== b)

  const area = (W - 2 * PAD) * (H - 2 * PAD)
  const k = Math.min(240, Math.max(140, Math.sqrt(area / n) * 0.65))
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
        // Strangers stop shoving once they are well apart, so islands drift
        // back toward the center instead of fleeing to the corners.
        if (d > 2.2 * k) continue
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
      force[i].x += (W / 2 - pos[i].x) * 0.06
      force[i].y += (H / 2 - pos[i].y) * 0.06
      const f = Math.sqrt(force[i].x ** 2 + force[i].y ** 2) || 0.1
      const step = Math.min(f, heat)
      pos[i].x += (force[i].x / f) * step
      pos[i].y += (force[i].y / f) * step
      pos[i].x = Math.max(PAD, Math.min(W - PAD, pos[i].x))
      pos[i].y = Math.max(PAD, Math.min(H - PAD, pos[i].y))
    }
  }

  // Fit the settled web to the frame: centered, gently scaled, never cramped.
  const xs = pos.map(p => p.x)
  const ys = pos.map(p => p.y)
  const minX = Math.min(...xs); const maxX = Math.max(...xs)
  const minY = Math.min(...ys); const maxY = Math.max(...ys)
  const spanX = Math.max(maxX - minX, 60)
  const spanY = Math.max(maxY - minY, 60)
  const scale = Math.min((W - 2 * PAD) / spanX, (H - 2 * PAD) / spanY, 1.3)
  for (const p of pos) {
    p.x = W / 2 + (p.x - (minX + maxX) / 2) * scale
    p.y = H / 2 + (p.y - (minY + maxY) / 2) * scale
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
  const [exporting, setExporting] = useState(false)

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

      <div className="toolbar">
        <span className="web-legend-inline">Hover a name to see who stands near them.</span>
        <button className="btn" onClick={() => setExporting(true)}>Export parchment</button>
      </div>

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
        Add ties from a person&apos;s page in the ledger.
      </p>

      {exporting && (
        <ParchmentModal
          doc={{ title: 'The Web of Windhelm', body: '', ...todayWorldDate() }}
          initialStyle="seal"
          onClose={() => setExporting(false)}
        >
          <WebInk nodes={nodes} edges={edges} positions={positions} underGlass={underGlass} />
        </ParchmentModal>
      )}
    </section>
  )
}
