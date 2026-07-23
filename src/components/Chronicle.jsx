import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { caseStepLabel, formatWorldDate, formatRealDate, timeAgo, TAGS } from '../lore.js'

const KINDS = [
  { key: 'note', label: 'Ledger notes', glyph: '✒' },
  { key: 'entry', label: 'Journal', glyph: '❧' },
  { key: 'step', label: 'Case steps', glyph: '⚖' },
  { key: 'dose', label: 'Doses', glyph: '☠' },
  { key: 'scrap', label: 'Quick notes', glyph: '✎' }
]

function buildEvents (db) {
  const events = []
  for (const p of db.people) {
    for (const n of p.notes) {
      events.push({
        kind: 'note',
        when: n.createdAt,
        title: p.name,
        href: `#/person/${p.id}`,
        text: n.text,
        tags: n.tags
      })
    }
  }
  for (const e of db.journal) {
    events.push({
      kind: 'entry',
      when: e.createdAt,
      title: e.title || 'Untitled entry',
      href: `#/journal/${e.id}`,
      text: formatWorldDate(e) || '',
      snippet: (e.body || '').replace(/\[\[(.*?)\]\]/g, '█████').slice(0, 160)
    })
  }
  for (const c of db.cases) {
    const target = db.people.find(p => p.id === c.personId)
    const label = c.title || (target ? `Against ${target.name}` : 'Unnamed matter')
    for (const s of c.steps) {
      events.push({
        kind: 'step',
        when: s.createdAt,
        title: `${label} · ${caseStepLabel(s.type)}`,
        href: `#/cases/${c.id}`,
        text: s.text
      })
    }
  }
  for (const p of db.poison) {
    events.push({
      kind: 'dose',
      when: p.createdAt,
      title: `${p.dose ?? '?'}${p.unit ? ` ${p.unit}` : ''}${p.dateText ? ` · ${p.dateText}` : ''}`,
      href: '#/poison',
      text: p.effect || p.note || ''
    })
  }
  for (const q of db.quicknotes) {
    events.push({ kind: 'scrap', when: q.createdAt, title: '', href: '#/quick', text: q.text })
  }
  return events.sort((a, b) => new Date(b.when) - new Date(a.when))
}

function monthKey (iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function Chronicle () {
  const { db } = useData()
  const [kind, setKind] = useState(null)
  const [shown, setShown] = useState(120)

  const events = useMemo(() => buildEvents(db), [db])
  const filtered = kind ? events.filter(e => e.kind === kind) : events
  const visible = filtered.slice(0, shown)

  let lastMonth = null

  return (
    <section>
      <header className="page-head">
        <h1>The Chronicle</h1>
        <p className="page-sub">Everything set down, in the order it was set down. The whole night&apos;s work, one river.</p>
      </header>

      <div className="toolbar">
        <div className="tag-row">
          {KINDS.map(k => (
            <button
              key={k.key}
              className={'tag chron-tag' + (kind === k.key ? ' on' : '')}
              onClick={() => setKind(kind === k.key ? null : k.key)}
            >
              {k.glyph} {k.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="empty">Nothing yet recorded. The chronicle waits for its first line.</p>
      )}

      <ol className="chron-list">
        {visible.map((e, i) => {
          const mk = monthKey(e.when)
          const header = mk !== lastMonth ? mk : null
          lastMonth = mk
          const glyph = KINDS.find(k => k.key === e.kind)?.glyph
          return (
            <li key={i}>
              {header && <div className="chron-month">{header}</div>}
              <a className="chron-row" href={e.href}>
                <span className={`chron-glyph glyph-${e.kind}`} aria-hidden="true">{glyph}</span>
                <div className="chron-body">
                  <div className="chron-head">
                    {e.title && <span className="chron-title">{e.title}</span>}
                    {e.tags && e.tags.map(t => {
                      const tag = TAGS.find(x => x.key === t)
                      return tag ? <span key={t} className={`tag tag-${t} static`}>{tag.label}</span> : null
                    })}
                    <span className="note-time" title={formatRealDate(e.when)}>{timeAgo(e.when)}</span>
                  </div>
                  {e.text && <p className="chron-text">{e.text}</p>}
                  {e.snippet && <p className="chron-snippet">{e.snippet}</p>}
                </div>
              </a>
            </li>
          )
        })}
      </ol>

      {filtered.length > shown && (
        <div className="chron-more">
          <button className="btn" onClick={() => setShown(s => s + 120)}>
            Turn back further
          </button>
        </div>
      )}
    </section>
  )
}
