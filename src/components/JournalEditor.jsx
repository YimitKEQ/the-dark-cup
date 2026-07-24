import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../state.jsx'
import { MONTHS, DEFAULT_YEAR, STYLES, formatWorldDate, todayWorldDate, countWords } from '../lore.js'
import { go } from '../App.jsx'
import { toast } from '../toast.js'

const draftKey = (entryId) => `darkcup-draft-${entryId || 'new'}`

function loadDraft (entryId) {
  try {
    const raw = localStorage.getItem(draftKey(entryId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function JournalEditor ({ entryId }) {
  const { db, addJournal, updateJournal } = useData()
  const existing = entryId ? db.journal.find(e => e.id === entryId) : null

  const [restored, setRestored] = useState(false)
  const [f, setF] = useState(() => {
    const draft = loadDraft(entryId)
    if (draft) return draft
    if (existing) {
      return { title: existing.title, day: existing.day || '', month: existing.month || '', year: existing.year || DEFAULT_YEAR, body: existing.body, style: existing.style || 'court', personIds: existing.personIds || [] }
    }
    const today = todayWorldDate()
    return { title: '', day: today.day, month: today.month, year: today.year, body: '', style: 'court', personIds: [] }
  })
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [personQuery, setPersonQuery] = useState('')
  const bodyRef = useRef(null)

  useEffect(() => {
    if (loadDraft(entryId)) setRestored(true)
  }, [entryId])

  const set = (k) => (e) => { setF(v => ({ ...v, [k]: e.target.value })); setDirty(true) }

  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      try { localStorage.setItem(draftKey(entryId), JSON.stringify(f)) } catch { /* storage full */ }
    }, 600)
    return () => clearTimeout(timer)
  }, [f, dirty, entryId])

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
  const words = useMemo(() => countWords(f.body), [f.body])
  const datePreview = formatWorldDate({ day: f.day ? Number(f.day) : null, month: f.month, year: f.year })

  async function save () {
    if (!canSave) return
    setBusy(true)
    try {
      const payload = { ...f, day: f.day ? Number(f.day) : null }
      const saved = existing
        ? await updateJournal({ ...existing, ...payload })
        : await addJournal(payload)
      setDirty(false)
      try { localStorage.removeItem(draftKey(entryId)) } catch { /* fine */ }
      toast(existing ? 'Amended.' : 'Set down.')
      go(`/journal/${saved.id}`)
    } finally {
      setBusy(false)
    }
  }

  function discardDraft () {
    try { localStorage.removeItem(draftKey(entryId)) } catch { /* fine */ }
    setRestored(false)
    setDirty(false)
    const today = todayWorldDate()
    setF(existing
      ? { title: existing.title, day: existing.day || '', month: existing.month || '', year: existing.year || DEFAULT_YEAR, body: existing.body, style: existing.style || 'court', personIds: existing.personIds || [] }
      : { title: '', day: today.day, month: today.month, year: today.year, body: '', style: 'court', personIds: [] })
  }

  function redactSelection () {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: a, selectionEnd: b } = el
    const inner = f.body.slice(a, b)
    const next = f.body.slice(0, a) + '[[' + inner + ']]' + f.body.slice(b)
    setF(v => ({ ...v, body: next }))
    setDirty(true)
    requestAnimationFrame(() => {
      el.focus()
      const pos = inner ? b + 4 : a + 2
      el.setSelectionRange(inner ? a : pos, pos)
    })
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

      {restored && (
        <div className="draft-notice">
          Unsaved ink was recovered from last time.
          <button className="link-btn" onClick={discardDraft}>discard it</button>
        </div>
      )}

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
        {datePreview && <span className="date-preview">{datePreview}</span>}
      </div>

      <div className="editor-tools">
        <button className="btn ghost" onClick={redactSelection} title="Wrap the selected text in [[double brackets]]">
          Redact selection
        </button>
        <span className="word-count">{words === 0 ? '' : words === 1 ? '1 word set down' : `${words} words set down`}</span>
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
                className={'style-pick swatch-' + s.key + (f.style === s.key ? ' on' : '')}
                onClick={() => { setF(v => ({ ...v, style: s.key })); setDirty(true) }}
                title={s.blurb}
              >
                <span className="swatch" />
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
