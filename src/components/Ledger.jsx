import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { TAGS, timeAgo, snippet } from '../lore.js'
import { go } from '../App.jsx'

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

export default function Ledger () {
  const { db } = useData()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState(null)
  const [adding, setAdding] = useState(false)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return db.people
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
        const last = p.notes[0]
        return { person: p, match, noteCount: tagged.length, last }
      })
      .filter(Boolean)
  }, [db.people, query, tag])

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
      </div>

      {adding
        ? <NewPersonForm onDone={() => setAdding(false)} />
        : <button className="btn add-btn" onClick={() => setAdding(true)}>Enter a new name</button>}

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
