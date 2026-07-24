import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../state.jsx'
import { TAGS, TIE_KINDS, tieLabel, formatRealDate, timeAgo } from '../lore.js'
import { go, overlayOpen } from '../App.jsx'
import { toast } from '../toast.js'
import ConfirmButton from './ConfirmButton.jsx'
import ParchmentModal from './ParchmentModal.jsx'

function TiesBlock ({ person }) {
  const { db, addTie, deleteTie } = useData()
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('ally')
  const [note, setNote] = useState('')

  const ties = person.ties || []
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return db.people
      .filter(p => p.id !== person.id && p.name.toLowerCase().includes(q))
      .slice(0, 5)
  }, [db.people, query, person.id])

  async function tie (target) {
    await addTie(person, { personId: target.id, kind, note: note.trim() })
    setQuery(''); setNote(''); setAdding(false)
    toast(`Tied to ${target.name}.`)
  }

  return (
    <div className="ties-block">
      <div className="ties-row">
        {ties.map(t => {
          const other = db.people.find(p => p.id === t.personId)
          if (!other) return null
          return (
            <span key={t.id} className={`tie-chip tie-${t.kind}`} title={t.note || tieLabel(t.kind)}>
              <em>{tieLabel(t.kind)}</em>
              <a href={`#/person/${other.id}`}>{other.name}</a>
              <button className="tie-x" title="Sever" onClick={() => deleteTie(person, t.id)}>×</button>
            </span>
          )
        })}
        {!adding && (
          <button className="link-btn" onClick={() => setAdding(true)}>
            {ties.length === 0 ? 'tie them to someone' : 'add a tie'}
          </button>
        )}
      </div>
      {adding && (
        <div className="tie-form">
          <select value={kind} onChange={e => setKind(e.target.value)}>
            {TIE_KINDS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
          <input
            autoFocus
            placeholder="To whom? Search the ledger…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setAdding(false) }}
          />
          <input
            className="tie-note"
            placeholder="A word on it (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          {matches.length > 0 && (
            <ul className="person-suggest tie-suggest">
              {matches.map(p => (
                <li key={p.id}>
                  <button onClick={() => tie(p)}>{p.name}<span>{p.role}</span></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function buildDossier (person) {
  const station = [person.role, person.allegiance].filter(Boolean).join(', ')
  const opening = [
    `Concerning ${person.name}${station ? `, ${station}` : ''}.`,
    person.metAt ? `First met at ${person.metAt}.` : ''
  ].filter(Boolean).join(' ')
  const paragraphs = person.notes.slice().reverse().map(n => {
    const tags = n.tags.map(t => TAGS.find(x => x.key === t)?.label).filter(Boolean).join(', ')
    const head = `${formatRealDate(n.createdAt, false)}${tags ? ` · ${tags}` : ''}`
    return `${head}\n${n.text}`
  })
  return {
    title: person.name,
    day: null,
    month: '',
    year: '',
    body: [opening, ...paragraphs].join('\n\n')
  }
}

function NoteComposer ({ person, focusRef }) {
  const { addNote } = useData()
  const [text, setText] = useState('')
  const [tags, setTags] = useState([])
  const [busy, setBusy] = useState(false)

  const toggle = (key) => setTags(t => t.includes(key) ? t.filter(x => x !== key) : [...t, key])

  async function save () {
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      await addNote(person, { text: text.trim(), tags })
      setText('')
      setTags([])
      toast('Recorded.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="composer">
      <textarea
        ref={focusRef}
        rows={3}
        placeholder={`What is known of ${person.name}…`}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') save() }}
      />
      <div className="composer-foot">
        <div className="tag-row">
          {TAGS.map(t => (
            <button
              key={t.key}
              className={`tag tag-${t.key}` + (tags.includes(t.key) ? ' on' : '')}
              onClick={() => toggle(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn primary" disabled={!text.trim() || busy} onClick={save} title="Ctrl+Enter">
          Record it
        </button>
      </div>
    </div>
  )
}

function Note ({ person, note }) {
  const { db, updateNote, deleteNote, importAll } = useData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note.text)
  const [draftTags, setDraftTags] = useState(note.tags)

  async function save () {
    if (!draft.trim()) return
    await updateNote(person, note.id, { text: draft.trim(), tags: draftTags })
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="note editing">
        <textarea rows={3} value={draft} onChange={e => setDraft(e.target.value)} autoFocus />
        <div className="composer-foot">
          <div className="tag-row">
            {TAGS.map(t => (
              <button
                key={t.key}
                className={`tag tag-${t.key}` + (draftTags.includes(t.key) ? ' on' : '')}
                onClick={() => setDraftTags(d => d.includes(t.key) ? d.filter(x => x !== t.key) : [...d, t.key])}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="form-row">
            <button className="btn" onClick={save}>Amend</button>
            <button className="btn ghost" onClick={() => { setEditing(false); setDraft(note.text); setDraftTags(note.tags) }}>Leave it</button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className={'note' + (note.tags[0] ? ` note-${note.tags[0]}` : '')}>
      <p className="note-text">{note.text}</p>
      <div className="note-meta">
        <span className="note-tags">
          {note.tags.map(k => {
            const t = TAGS.find(x => x.key === k)
            return t ? <span key={k} className={`tag tag-${k} static`}>{t.label}</span> : null
          })}
        </span>
        <span className="note-time" title={formatRealDate(note.createdAt)}>
          {timeAgo(note.createdAt)}{note.updatedAt ? ' · amended' : ''}
        </span>
        <span className="note-actions">
          <button className="link-btn" onClick={() => setEditing(true)}>amend</button>
          <ConfirmButton
            className="link-btn danger"
            label="strike"
            confirmLabel="strike it?"
            onConfirm={async () => {
              const snap = db
              await deleteNote(person, note.id)
              toast('Struck.', { label: 'Undo', fn: () => importAll(snap) })
            }}
          />
        </span>
      </div>
    </li>
  )
}

function HeaderEditor ({ person, onDone }) {
  const { updatePerson } = useData()
  const [f, setF] = useState({ name: person.name, role: person.role, allegiance: person.allegiance, metAt: person.metAt })
  const set = (k) => (e) => setF(v => ({ ...v, [k]: e.target.value }))

  async function save (e) {
    e.preventDefault()
    if (!f.name.trim()) return
    await updatePerson({ ...person, ...f })
    onDone()
  }

  return (
    <form className="new-person" onSubmit={save}>
      <input value={f.name} onChange={set('name')} placeholder="Name" autoFocus />
      <input value={f.role} onChange={set('role')} placeholder="What they are (rank, trade)" />
      <input value={f.allegiance} onChange={set('allegiance')} placeholder="Allegiance" />
      <input value={f.metAt} onChange={set('metAt')} placeholder="Where we met" />
      <div className="form-row">
        <button className="btn primary" type="submit">Amend the record</button>
        <button className="btn ghost" type="button" onClick={onDone}>Leave it</button>
      </div>
    </form>
  )
}

export default function PersonPage ({ personId }) {
  const { db, deletePerson, importAll } = useData()
  const [tag, setTag] = useState(null)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const composerRef = useRef(null)

  const person = db.people.find(p => p.id === personId)

  useEffect(() => {
    const onKey = (e) => {
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if (e.key.toLowerCase() === 'n' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey && !overlayOpen()) {
        e.preventDefault()
        composerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const tagCounts = useMemo(() => {
    const counts = {}
    for (const n of person?.notes || []) {
      for (const t of n.tags) counts[t] = (counts[t] || 0) + 1
    }
    return counts
  }, [person])

  const notes = useMemo(() => {
    if (!person) return []
    const q = query.trim().toLowerCase()
    return person.notes.filter(n =>
      (!tag || n.tags.includes(tag)) &&
      (!q || n.text.toLowerCase().includes(q))
    )
  }, [person, tag, query])

  if (!person) {
    return <p className="empty">No such name in the ledger. <a href="#/">Return to it.</a></p>
  }

  const journalMentions = db.journal.filter(e => (e.personIds || []).includes(person.id))
  const openCases = db.cases.filter(c => c.personId === person.id)

  return (
    <section>
      <a className="crumb" href="#/">← The Ledger</a>

      {editing
        ? <HeaderEditor person={person} onDone={() => setEditing(false)} />
        : (
          <header className="page-head person-head">
            <h1>{person.name}</h1>
            <p className="page-sub">
              {[person.role, person.allegiance].filter(Boolean).join(' · ') || 'Nothing yet known of their station.'}
              {person.metAt ? ` · met at ${person.metAt}` : ''}
            </p>
            <div className="head-actions">
              <button className="link-btn" onClick={() => setEditing(true)}>amend</button>
              {person.notes.length > 0 && (
                <button className="link-btn" onClick={() => setExporting(true)}>export dossier</button>
              )}
              <ConfirmButton
                className="link-btn danger"
                label="burn this page"
                confirmLabel="burn it, truly?"
                onConfirm={async () => {
                  const snap = db
                  await deletePerson(person.id)
                  toast('Burned.', { label: 'Undo', fn: () => importAll(snap) })
                  go('/')
                }}
              />
            </div>
          </header>
          )}

      <TiesBlock person={person} />

      <NoteComposer person={person} focusRef={composerRef} />

      <div className="toolbar slim">
        <input
          className="search-field"
          placeholder="Search these notes…"
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
              {t.label}{tagCounts[t.key] ? ` ${tagCounts[t.key]}` : ''}
            </button>
          ))}
        </div>
      </div>

      {notes.length === 0 && (
        <p className="empty">
          {person.notes.length === 0 ? 'Nothing recorded against this name yet.' : 'No note answers to that.'}
        </p>
      )}

      <ul className="note-list">
        {notes.map(n => <Note key={n.id} person={person} note={n} />)}
      </ul>

      {(journalMentions.length > 0 || openCases.length > 0) && (
        <footer className="mentions">
          {openCases.length > 0 && (
            <>
              <h2>Cases against them</h2>
              <ul>
                {openCases.map(c => (
                  <li key={c.id}>
                    <a href={`#/cases/${c.id}`}>{c.title || 'The matter at hand'}</a>
                    <span className={`tag static status-${c.status}`}>{c.status}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {journalMentions.length > 0 && (
            <>
              <h2>Named in the journal</h2>
              <ul>
                {journalMentions.map(e => (
                  <li key={e.id}><a href={`#/journal/${e.id}`}>{e.title || 'Untitled entry'}</a></li>
                ))}
              </ul>
            </>
          )}
        </footer>
      )}

      {exporting && (
        <ParchmentModal
          doc={buildDossier(person)}
          initialStyle="court"
          onClose={() => setExporting(false)}
        />
      )}
    </section>
  )
}
