import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../state.jsx'
import { MONTHS, DEFAULT_YEAR, STYLES } from '../lore.js'
import { go } from '../App.jsx'

export default function JournalEditor ({ entryId }) {
  const { db, addJournal, updateJournal } = useData()
  const existing = entryId ? db.journal.find(e => e.id === entryId) : null

  const [f, setF] = useState(() => existing
    ? { title: existing.title, day: existing.day || '', month: existing.month || '', year: existing.year || DEFAULT_YEAR, body: existing.body, style: existing.style || 'court', personIds: existing.personIds || [] }
    : { title: '', day: '', month: MONTHS[new Date().getMonth()], year: DEFAULT_YEAR, body: '', style: 'court', personIds: [] })
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [personQuery, setPersonQuery] = useState('')
  const bodyRef = useRef(null)

  const set = (k) => (e) => { setF(v => ({ ...v, [k]: e.target.value })); setDirty(true) }

  useEffect(() => {
    if (!dirty) return
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(320, el.scrollHeight + 4) + 'px'
  }, [f.body])

  const canSave = (f.title.trim() || f.body.trim()) && !busy

  async function save () {
    if (!canSave) return
    setBusy(true)
    try {
      const payload = { ...f, day: f.day ? Number(f.day) : null }
      const saved = existing
        ? await updateJournal({ ...existing, ...payload })
        : await addJournal(payload)
      setDirty(false)
      go(`/journal/${saved.id}`)
    } finally {
      setBusy(false)
    }
  }

  function onKeyDown (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      save()
    }
  }

  const togglePerson = (pid) => {
    setF(v => ({
      ...v,
      personIds: v.personIds.includes(pid) ? v.personIds.filter(x => x !== pid) : [...v.personIds, pid]
    }))
    setDirty(true)
  }

  const matchedPeople = useMemo(() => {
    const q = personQuery.trim().toLowerCase()
    if (!q) return []
    return db.people.filter(p => !f.personIds.includes(p.id) && p.name.toLowerCase().includes(q)).slice(0, 6)
  }, [db.people, personQuery, f.personIds])

  if (entryId && !existing) {
    return <p className="empty">That page has been torn out. <a href="#/journal">Back to the journal.</a></p>
  }

  return (
    <section className="editor" onKeyDown={onKeyDown}>
      <a className="crumb" href={existing ? `#/journal/${existing.id}` : '#/journal'}>← {existing ? 'Back to the entry' : 'The Journal'}</a>

      <input
        className="editor-title"
        placeholder="A title for this entry"
        value={f.title}
        onChange={set('title')}
        autoFocus={!existing}
      />

      <div className="editor-dateline">
        <input className="date-day" type="number" min="1" max="31" placeholder="Day" value={f.day} onChange={set('day')} />
        <select className="date-month" value={f.month} onChange={set('month')}>
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input className="date-year" placeholder="Year" value={f.year} onChange={set('year')} />
      </div>

      <textarea
        ref={bodyRef}
        className="editor-body"
        placeholder={'Write. Wrap anything in double brackets to redact it on the parchment, like [[this]].'}
        value={f.body}
        onChange={set('body')}
      />

      <div className="editor-panel">
        <div className="panel-block">
          <h3>Named in this entry</h3>
          <div className="mention-chips">
            {f.personIds.map(pid => {
              const p = db.people.find(x => x.id === pid)
              return p
                ? <button key={pid} className="mention-chip removable" onClick={() => togglePerson(pid)} title="Remove">{p.name} ×</button>
                : null
            })}
          </div>
          <input
            placeholder="Link a name from the ledger…"
            value={personQuery}
            onChange={e => setPersonQuery(e.target.value)}
          />
          {matchedPeople.length > 0 && (
            <ul className="person-suggest">
              {matchedPeople.map(p => (
                <li key={p.id}>
                  <button onClick={() => { togglePerson(p.id); setPersonQuery('') }}>{p.name}<span>{p.role}</span></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel-block">
          <h3>Parchment style</h3>
          <div className="style-row">
            {STYLES.map(s => (
              <button
                key={s.key}
                className={'style-pick' + (f.style === s.key ? ' on' : '')}
                onClick={() => { setF(v => ({ ...v, style: s.key })); setDirty(true) }}
                title={s.blurb}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="editor-foot">
        <button className="btn primary" disabled={!canSave} onClick={save}>
          {existing ? 'Amend the entry' : 'Set it down'} <kbd>Ctrl S</kbd>
        </button>
        {dirty && <span className="dirty-note">unsaved ink on the page</span>}
      </div>
    </section>
  )
}
