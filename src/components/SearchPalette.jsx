import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../state.jsx'
import { snippet, formatWorldDate, timeAgo } from '../lore.js'
import { go } from '../App.jsx'

function Mark ({ text, query }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1 || !query) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function buildResults (db, query) {
  const q = query.trim().toLowerCase()
  const out = []

  for (const p of db.people) {
    const meta = [p.name, p.role, p.allegiance, p.metAt].filter(Boolean).join(' · ')
    if (meta.toLowerCase().includes(q)) {
      out.push({ group: 'People', title: p.name, sub: meta.replace(p.name, '').replace(/^ · /, ''), href: `/person/${p.id}`, score: p.name.toLowerCase().startsWith(q) ? 0 : 1 })
    }
  }
  for (const p of db.people) {
    for (const n of p.notes) {
      if (n.text.toLowerCase().includes(q)) {
        out.push({ group: 'Notes', title: p.name, sub: snippet(n.text, q, 46), href: `/person/${p.id}`, score: 2 })
      }
    }
  }
  for (const e of db.journal) {
    const title = e.title || 'Untitled entry'
    if (title.toLowerCase().includes(q) || (e.body || '').toLowerCase().includes(q)) {
      const inBody = (e.body || '').toLowerCase().includes(q)
      out.push({
        group: 'Journal',
        title,
        sub: inBody ? snippet(e.body, q, 46) : formatWorldDate(e),
        href: `/journal/${e.id}`,
        score: title.toLowerCase().includes(q) ? 1 : 3
      })
    }
  }
  for (const c of db.cases) {
    const target = db.people.find(p => p.id === c.personId)
    const label = c.title || (target ? `Against ${target.name}` : 'Unnamed matter')
    const inSteps = c.steps.find(s => s.text.toLowerCase().includes(q))
    if (label.toLowerCase().includes(q) || (target && target.name.toLowerCase().includes(q)) || inSteps) {
      out.push({
        group: 'Cases',
        title: label,
        sub: inSteps ? snippet(inSteps.text, q, 46) : `${c.status} · ${c.steps.length} steps`,
        href: `/cases/${c.id}`,
        score: 2
      })
    }
  }
  for (const s of db.quicknotes) {
    if (s.text.toLowerCase().includes(q)) {
      out.push({ group: 'Quick Notes', title: snippet(s.text, q, 52), sub: timeAgo(s.createdAt), href: '/quick', score: 3 })
    }
  }
  out.sort((a, b) => a.score - b.score)
  return out.slice(0, 16)
}

function buildIdle (db, onJot) {
  const actions = [
    { group: 'Do', title: 'Take up the quill', sub: 'a new journal entry', href: '/journal/new' },
    { group: 'Do', title: 'Jot a quick note', sub: 'press Q anywhere', action: onJot },
    { group: 'Do', title: 'Open a case', sub: 'begin the patient work', href: '/cases' }
  ]
  const recentPeople = db.people
    .filter(p => p.notes.length > 0)
    .slice()
    .sort((a, b) => new Date(b.notes[0].createdAt) - new Date(a.notes[0].createdAt))
    .slice(0, 4)
    .map(p => ({ group: 'Recently touched', title: p.name, sub: timeAgo(p.notes[0].createdAt), href: `/person/${p.id}` }))
  const recentEntries = db.journal.slice(0, 3).map(e => ({
    group: 'Recently touched',
    title: e.title || 'Untitled entry',
    sub: formatWorldDate(e) || timeAgo(e.createdAt),
    href: `/journal/${e.id}`
  }))
  return [...actions, ...recentPeople, ...recentEntries]
}

export default function SearchPalette ({ onClose, onJot }) {
  const { db } = useData()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => (
    query.trim() ? buildResults(db, query) : buildIdle(db, onJot)
  ), [db, query, onJot])

  useEffect(() => { setActive(0) }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector('.active')
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function pick (r) {
    onClose()
    if (r.action) r.action()
    else go(r.href)
  }

  function onKeyDown (e) {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter' && results[active]) pick(results[active])
  }

  let lastGroup = null

  return (
    <div className="palette-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="palette" onKeyDown={onKeyDown}>
        <input
          ref={inputRef}
          placeholder="Whisper a name, a debt, a secret…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query.trim() && results.length === 0 && (
          <p className="palette-empty">Nothing in the records answers to that.</p>
        )}
        <ul className="palette-results" ref={listRef}>
          {results.map((r, i) => {
            const header = r.group !== lastGroup ? r.group : null
            lastGroup = r.group
            return (
              <li key={i}>
                {header && <div className="palette-group">{header}</div>}
                <button
                  className={'palette-row' + (i === active ? ' active' : '')}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(r)}
                >
                  <span className="palette-title"><Mark text={r.title} query={query} /></span>
                  {r.sub && <span className="palette-sub"><Mark text={r.sub} query={query} /></span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
