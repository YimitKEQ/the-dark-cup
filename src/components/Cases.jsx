import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { CASE_STATUS, timeAgo } from '../lore.js'
import { go } from '../App.jsx'

function NewCaseForm ({ onDone }) {
  const { db, addCase } = useData()
  const [query, setQuery] = useState('')
  const [personId, setPersonId] = useState(null)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  const person = db.people.find(p => p.id === personId)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || person) return []
    return db.people.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6)
  }, [db.people, query, person])

  async function submit (e) {
    e.preventDefault()
    if ((!personId && !title.trim()) || busy) return
    setBusy(true)
    try {
      const c = await addCase({ personId: personId || '', title: title.trim(), status: 'open', steps: [] })
      go(`/cases/${c.id}`)
    } finally {
      setBusy(false)
      onDone()
    }
  }

  return (
    <form className="new-person" onSubmit={submit}>
      {person
        ? (
          <div className="mention-chips">
            <button type="button" className="mention-chip removable" onClick={() => { setPersonId(null); setQuery('') }}>
              Against {person.name} ×
            </button>
          </div>
          )
        : (
          <input
            autoFocus
            placeholder="Against whom? Search the ledger…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          )}
      {matches.length > 0 && (
        <ul className="person-suggest">
          {matches.map(p => (
            <li key={p.id}>
              <button type="button" onClick={() => { setPersonId(p.id); setQuery('') }}>
                {p.name}<span>{p.role}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        placeholder="A name for the matter (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div className="form-row">
        <button className="btn primary" type="submit" disabled={(!personId && !title.trim()) || busy}>
          Open the case
        </button>
        <button className="btn ghost" type="button" onClick={onDone}>Never mind</button>
      </div>
    </form>
  )
}

export default function Cases () {
  const { db } = useData()
  const [status, setStatus] = useState(null)
  const [adding, setAdding] = useState(false)

  const rows = db.cases.filter(c => !status || c.status === status)
  const personName = (id) => db.people.find(p => p.id === id)?.name

  return (
    <section>
      <header className="page-head">
        <h1>The Cases</h1>
        <p className="page-sub">Patient work, step by step, until they see reason.</p>
      </header>

      <div className="toolbar">
        <div className="tag-row">
          {CASE_STATUS.map(s => (
            <button
              key={s.key}
              className={`tag status-${s.key}` + (status === s.key ? ' on' : '')}
              onClick={() => setStatus(status === s.key ? null : s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {!adding && <button className="btn primary" onClick={() => setAdding(true)}>Open a case</button>}
      </div>

      {adding && <NewCaseForm onDone={() => setAdding(false)} />}

      {rows.length === 0 && (
        <p className="empty">
          {db.cases.length === 0
            ? 'No cases open. Windhelm must be behaving itself.'
            : 'No case answers to that.'}
        </p>
      )}

      <ul className="person-list">
        {rows.map(c => {
          const name = personName(c.personId)
          const last = c.steps[c.steps.length - 1]
          return (
            <li key={c.id}>
              <a className="person-row" href={`#/cases/${c.id}`}>
                <div className="person-main">
                  <span className="person-name">{c.title || (name ? `Against ${name}` : 'Unnamed matter')}</span>
                  <span className={`tag static status-${c.status}`}>{c.status}</span>
                </div>
                <div className="person-side">
                  {name && c.title && <span>against {name}</span>}
                  <span>
                    {c.steps.length === 0 ? 'no steps taken' : c.steps.length === 1 ? '1 step taken' : `${c.steps.length} steps taken`}
                    {last ? ` · ${timeAgo(last.createdAt)}` : ''}
                  </span>
                </div>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
