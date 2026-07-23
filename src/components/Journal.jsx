import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { formatWorldDate, timeAgo } from '../lore.js'

export default function Journal () {
  const { db } = useData()
  const [query, setQuery] = useState('')

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return db.journal
    return db.journal.filter(e =>
      (e.title || '').toLowerCase().includes(q) ||
      (e.body || '').toLowerCase().includes(q)
    )
  }, [db.journal, query])

  const personName = (id) => db.people.find(p => p.id === id)?.name

  return (
    <section>
      <header className="page-head">
        <h1>The Journal</h1>
        <p className="page-sub">Set down in my own hand, for no eyes but mine.</p>
      </header>

      <div className="toolbar">
        <input
          className="search-field"
          placeholder="Search the journal…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <a className="btn primary" href="#/journal/new">Take up the quill</a>
      </div>

      {entries.length === 0 && (
        <p className="empty">
          {db.journal.length === 0
            ? 'The journal waits, its pages blank.'
            : 'Nothing written answers to that.'}
        </p>
      )}

      <ul className="entry-list">
        {entries.map(e => (
          <li key={e.id}>
            <a className="entry-row" href={`#/journal/${e.id}`}>
              <div className="entry-head">
                <span className="entry-title">{e.title || 'Untitled entry'}</span>
                <span className="entry-date">{formatWorldDate(e) || timeAgo(e.createdAt)}</span>
              </div>
              <p className="entry-snippet">
                {(e.body || '').replace(/\[\[(.*?)\]\]/g, '█████').slice(0, 220)}
              </p>
              {(e.personIds || []).length > 0 && (
                <div className="entry-people">
                  {e.personIds.map(pid => personName(pid)).filter(Boolean).map(name => (
                    <span key={name} className="mention-chip">{name}</span>
                  ))}
                </div>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
