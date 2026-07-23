import { useRef, useState } from 'react'
import { useData } from '../state.jsx'
import ConfirmButton from './ConfirmButton.jsx'

export default function Archive () {
  const { db, importAll } = useData()
  const fileRef = useRef(null)
  const [pending, setPending] = useState(null)
  const [message, setMessage] = useState(null)

  async function onFile (e) {
    setMessage(null)
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const doc = JSON.parse(text)
      if (!Array.isArray(doc.people) || !Array.isArray(doc.journal)) {
        throw new Error('That file is not a Dark Cup export.')
      }
      setPending({ doc, name: file.name })
    } catch (err) {
      setPending(null)
      setMessage({ kind: 'error', text: err.message })
    } finally {
      e.target.value = ''
    }
  }

  async function doImport () {
    try {
      await importAll(pending.doc)
      setPending(null)
      setMessage({ kind: 'ok', text: 'The records have been restored. The old book was copied to data/backups first.' })
    } catch (err) {
      setMessage({ kind: 'error', text: err.message })
    }
  }

  const counts = [
    `${db.people.length} people`,
    `${db.people.reduce((n, p) => n + p.notes.length, 0)} ledger notes`,
    `${db.journal.length} journal entries`
  ].join(' · ')

  return (
    <section>
      <header className="page-head">
        <h1>The Archive</h1>
        <p className="page-sub">Where the book itself is kept safe.</p>
      </header>

      <div className="archive-block">
        <h2>What the book holds</h2>
        <p>{counts}</p>
        <p className="detail">
          Everything lives on this machine, in <code>data/darkcup.json</code>. Each time the app starts,
          a dated copy is set aside in <code>data/backups</code>; the last twenty are kept.
        </p>
      </div>

      <div className="archive-block">
        <h2>Carry a copy out</h2>
        <p className="detail">A single file holding every record, fit for keeping somewhere safe.</p>
        <a className="btn primary" href="/api/export" download>Export everything</a>
      </div>

      <div className="archive-block">
        <h2>Restore from a copy</h2>
        <p className="detail">
          This replaces the entire book with the file you choose. The current book is backed up first.
        </p>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: 'none' }} />
        {!pending && <button className="btn" onClick={() => fileRef.current?.click()}>Choose a file</button>}
        {pending && (
          <div className="import-confirm">
            <p>
              <strong>{pending.name}</strong>: {pending.doc.people.length} people, {pending.doc.journal.length} journal entries.
            </p>
            <div className="form-row">
              <ConfirmButton
                className="btn danger"
                label="Replace everything"
                confirmLabel="Replace it all, truly?"
                onConfirm={doImport}
              />
              <button className="btn ghost" onClick={() => setPending(null)}>Never mind</button>
            </div>
          </div>
        )}
        {message && <p className={`archive-msg ${message.kind}`}>{message.text}</p>}
      </div>
    </section>
  )
}
