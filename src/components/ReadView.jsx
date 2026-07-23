import { useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { useData } from '../state.jsx'
import { STYLES, formatRealDate } from '../lore.js'
import { go } from '../App.jsx'
import ParchmentPage from './ParchmentPage.jsx'
import ConfirmButton from './ConfirmButton.jsx'

function slug (s) {
  return (s || 'entry').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'entry'
}

export default function ReadView ({ entryId }) {
  const { db, updateJournal, deleteJournal } = useData()
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)
  const captureRef = useRef(null)

  const entry = db.journal.find(e => e.id === entryId)
  if (!entry) {
    return <p className="empty">That page has been torn out. <a href="#/journal">Back to the journal.</a></p>
  }

  const styleKey = entry.style || 'court'

  async function setStyle (key) {
    await updateJournal({ ...entry, style: key })
  }

  async function download () {
    if (downloading) return
    setDownloading(true)
    setDone(false)
    try {
      await document.fonts.ready
      const node = captureRef.current
      const blob = await toBlob(node, {
        pixelRatio: 2,
        backgroundColor: 'rgba(0,0,0,0)',
        width: 900,
        height: node.offsetHeight
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dark-cup-${slug(entry.title)}.png`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 30000)
      setDone(true)
      setTimeout(() => setDone(false), 4000)
    } finally {
      setDownloading(false)
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
              onClick={() => setStyle(s.key)}
              title={s.blurb}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="read-actions">
          <button className="btn primary" onClick={download} disabled={downloading}>
            {downloading ? 'Pressing the seal…' : done ? 'Delivered' : 'Export parchment'}
          </button>
          <a className="btn" href={`#/journal/${entry.id}/edit`}>Amend</a>
          <ConfirmButton
            className="btn ghost danger"
            label="Burn it"
            confirmLabel="Burn it, truly?"
            onConfirm={async () => { await deleteJournal(entry.id); go('/journal') }}
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
