import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { formatRealDate, timeAgo } from '../lore.js'
import { toast } from '../toast.js'
import ConfirmButton from './ConfirmButton.jsx'

function SendToLedger ({ quick, onDone }) {
  const { db, addNote, deleteQuick } = useData()
  const [query, setQuery] = useState('')

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return db.people.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5)
  }, [db.people, query])

  async function send (person) {
    await addNote(person, { text: quick.text, tags: [] })
    await deleteQuick(quick.id)
    toast(`Entered against ${person.name}.`)
    onDone()
  }

  return (
    <div className="send-to-ledger">
      <input
        autoFocus
        placeholder="Whose page does this belong on?"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') onDone() }}
      />
      {matches.length > 0 && (
        <ul className="person-suggest">
          {matches.map(p => (
            <li key={p.id}>
              <button onClick={() => send(p)}>{p.name}<span>{p.role}</span></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function QuickNotes () {
  const { db, addQuick, deleteQuick } = useData()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [sendingId, setSendingId] = useState(null)

  async function save () {
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      await addQuick({ text: text.trim() })
      setText('')
      toast('Jotted down.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <header className="page-head">
        <h1>Quick Notes</h1>
        <p className="page-sub">For the moment between moments. Press Q anywhere to jot one.</p>
      </header>

      <div className="composer">
        <textarea
          rows={2}
          autoFocus
          placeholder="Heard something? Down it goes. Enter saves."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } }}
        />
        <div className="composer-foot">
          <span className="jot-hint">Shift+Enter for a new line.</span>
          <button className="btn primary" disabled={!text.trim() || busy} onClick={save}>Jot it</button>
        </div>
      </div>

      {db.quicknotes.length === 0 && (
        <p className="empty">Nothing waiting. Either a quiet night, or you were not listening.</p>
      )}

      <ul className="note-list">
        {db.quicknotes.map(q => (
          <li key={q.id} className="note">
            <p className="note-text">{q.text}</p>
            <div className="note-meta">
              <span className="note-time" title={formatRealDate(q.createdAt)}>{timeAgo(q.createdAt)}</span>
              <span className="note-actions">
                <button className="link-btn" onClick={() => setSendingId(sendingId === q.id ? null : q.id)}>
                  to the ledger
                </button>
                <ConfirmButton className="link-btn danger" label="strike" confirmLabel="strike it?" onConfirm={() => deleteQuick(q.id)} />
              </span>
            </div>
            {sendingId === q.id && <SendToLedger quick={q} onDone={() => setSendingId(null)} />}
          </li>
        ))}
      </ul>
    </section>
  )
}
