import { useRef, useState } from 'react'
import { useData } from '../state.jsx'
import { STYLES, formatRealDate } from '../lore.js'
import { parchmentBlob, downloadBlob, copyBlob, canCopyImage, slugify } from '../exportImage.js'
import { toast } from '../toast.js'
import { go } from '../App.jsx'
import ParchmentPage from './ParchmentPage.jsx'
import ConfirmButton from './ConfirmButton.jsx'

export default function ReadView ({ entryId }) {
  const { db, updateJournal, deleteJournal, importAll } = useData()
  const [busy, setBusy] = useState(false)
  const captureRef = useRef(null)

  const entry = db.journal.find(e => e.id === entryId)
  if (!entry) {
    return <p className="empty">That page has been torn out. <a href="#/journal">Back to the journal.</a></p>
  }

  const styleKey = entry.style || 'court'

  async function withBlob (fn, doneMessage) {
    if (busy) return
    setBusy(true)
    try {
      const blob = await parchmentBlob(captureRef.current)
      await fn(blob)
      toast(doneMessage)
    } catch (err) {
      toast(`The press failed: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="read-view">
      <div className="read-controls">
        <a className="crumb" href="#/journal">← The Journal</a>
        <div className="style-row">
          {STYLES.map(s => (
            <button
              key={s.key}
              className={'style-pick' + (styleKey === s.key ? ' on' : '')}
              onClick={() => updateJournal({ ...entry, style: s.key })}
              title={s.blurb}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="read-actions">
          {canCopyImage() && (
            <button
              className="btn primary"
              disabled={busy}
              onClick={() => withBlob(copyBlob, 'Copied. Paste it into Discord.')}
            >
              {busy ? 'Pressing the seal…' : 'Copy for Discord'}
            </button>
          )}
          <button
            className="btn"
            disabled={busy}
            onClick={() => withBlob(b => downloadBlob(b, `dark-cup-${slugify(entry.title)}.png`), 'Delivered.')}
          >
            Download PNG
          </button>
          <a className="btn" href={`#/journal/${entry.id}/edit`}>Amend</a>
          <ConfirmButton
            className="btn ghost danger"
            label="Burn it"
            confirmLabel="Burn it, truly?"
            onConfirm={async () => {
              const snap = db
              await deleteJournal(entry.id)
              toast('Burned.', { label: 'Undo', fn: () => importAll(snap) })
              go('/journal')
            }}
          />
        </div>
      </div>

      <div className="desk">
        <ParchmentPage entry={entry} styleKey={styleKey} />
      </div>

      <p className="read-meta">
        Written {formatRealDate(entry.createdAt)}
        {entry.updatedAt && entry.updatedAt !== entry.createdAt ? ` · amended ${formatRealDate(entry.updatedAt)}` : ''}
      </p>

      <div className="capture-stage" aria-hidden="true">
        <ParchmentPage ref={captureRef} entry={entry} styleKey={styleKey} exporting />
      </div>
    </section>
  )
}
