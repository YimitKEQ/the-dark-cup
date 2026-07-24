import { useEffect, useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { TAGS, timeAgo, snippet } from '../lore.js'
import { go, overlayOpen } from '../App.jsx'
import { toast } from '../toast.js'

function NewPersonForm ({ onDone }) {
  const { addPerson } = useData()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [metAt, setMetAt] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit (e) {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      const person = await addPerson({ name, role, metAt, allegiance: '', notes: [] })
      toast('Entered in the ledger.')
      go(`/person/${person.id}`)
    } finally {
      setBusy(false)
      onDone()
    }
  }

  return (
    <form className="new-person" onSubmit={submit}>
      <input autoFocus placeholder="Their name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="What they are (rank, trade, allegiance)" value={role} onChange={e => setRole(e.target.value)} />
      <input placeholder="Where we met" value={metAt} onChange={e => setMetAt(e.target.value)} />
      <div className="form-row">
        <button className="btn primary" type="submit" disabled={!name.trim() || busy}>Enter them in the ledger</button>
        <button className="btn ghost" type="button" onClick={onDone}>Never mind</button>
      </div>
    </form>
  )
}

function TagMarks ({ person }) {
  const counts = {}
  for (const n of person.notes) {
    for (const t of n.tags) counts[t] = (counts[t] || 0) + 1
  }
  const present = TAGS.filter(t => counts[t.key])
  if (present.length === 0) return null
  return (
    <span className="tag-marks">
      {present.map(t => (
        <span key={t.key} className={`tag-mark mark-${t.key}`} title={`${counts[t.key]} ${t.label.toLowerCase()}${counts[t.key] > 1 ? 's' : ''}`}>
          ◆<i>{counts[t.key]}</i>
        </span>
      ))}
    </span>
  )
}

const SORTS = [
  { key: 'touched', label: 'Last touched' },
  { key: 'name', label: 'By name' },
  { key: 'newest', label: 'Newest first' }
]

export default function Ledger () {
  const { db } = useData()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState(null)
  const [sort, setSort] = useState('touched')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if (e.key.toLowerCase() === 'n' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey && !overlayOpen()) {
        e.preventDefault()
        setAdding(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = db.people
      .map(p => {
        const tagged = tag ? p.notes.filter(n => n.tags.includes(tag)) : p.notes
        if (tag && tagged.length === 0) return null
        let match = null
        if (q) {
          const inMeta = [p.name, p.role, p.allegiance, p.metAt].join(' ').toLowerCase().includes(q)
          const hit = tagged.find(n => n.text.toLowerCase().includes(q))
          if (!inMeta && !hit) return null
          if (hit) match = snippet(hit.text, q)
        }
        return { person: p, match, noteCount: tagged.length, last: p.notes[0] }
      })
      .filter(Boolean)

    const by = {
      touched: (a, b) => new Date(b.last?.createdAt || b.person.createdAt) - new Date(a.last?.createdAt || a.person.createdAt),
      name: (a, b) => a.person.name.localeCompare(b.person.name),
      newest: (a, b) => new Date(b.person.createdAt) - new Date(a.person.createdAt)
    }
    return list.sort(by[sort] || by.touched)
  }, [db.people, query, tag, sort])

  return (
    <section>
      <header className="page-head">
        <h1>The Ledger</h1>
        <p className="page-sub">Every name worth remembering, and what they owe.</p>
      </header>

      <div className="toolbar">
        <input
          className="search-field"
          placeholder="Search names, trades, notes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)} title="Order of the ledger">
          {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div className="toolbar slim">
        <div className="tag-row">
          {TAGS.map(t => (
            <button
              key={t.key}
              className={`tag tag-${t.key}` + (tag === t.key ? ' on' : '')}
              onClick={() => setTag(tag === t.key ? null : t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {!adding && (
          <button className="btn add-btn" onClick={() => setAdding(true)}>
            Enter a new name <kbd>N</kbd>
          </button>
        )}
      </div>

      {adding && <NewPersonForm onDone={() => setAdding(false)} />}

      {rows.length === 0 && (
        <p className="empty">
          {db.people.length === 0
            ? 'The ledger lies open and empty. No names yet recorded.'
            : 'No entry answers to that. Perhaps they were careful.'}
        </p>
      )}

      <ul className="person-list">
        {rows.map(({ person: p, match, noteCount, last }) => (
          <li key={p.id}>
            <a className="person-row" href={`#/person/${p.id}`}>
              <div className="person-main">
                <span className="person-name">{p.name}</span>
                <span className="person-role">{[p.role, p.allegiance].filter(Boolean).join(' · ')}</span>
                <TagMarks person={p} />
              </div>
              <div className="person-side">
                {p.metAt && <span className="person-met">met at {p.metAt}</span>}
                <span className="person-count">
                  {noteCount === 0 ? 'nothing recorded' : noteCount === 1 ? '1 entry' : `${noteCount} entries`}
                  {last ? ` · ${timeAgo(last.createdAt)}` : ''}
                </span>
              </div>
              {match && <div className="person-match">…{match}</div>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
