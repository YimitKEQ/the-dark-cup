import { useRef, useState } from 'react'
import { STYLES } from '../lore.js'
import { parchmentBlob, downloadBlob, copyBlob, canCopyImage, slugify } from '../exportImage.js'
import { toast } from '../toast.js'
import ParchmentPage from './ParchmentPage.jsx'

export default function ParchmentModal ({ doc, initialStyle = 'court', onClose, children }) {
  const [styleKey, setStyleKey] = useState(initialStyle)
  const [busy, setBusy] = useState(false)
  const captureRef = useRef(null)

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
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-bar">
          <div className="style-row">
            {STYLES.map(s => (
              <button
                key={s.key}
                className={'style-pick' + (styleKey === s.key ? ' on' : '')}
                onClick={() => setStyleKey(s.key)}
                title={s.blurb}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="modal-actions">
            {canCopyImage() && (
              <button
                className="btn primary"
                disabled={busy}
                onClick={() => withBlob(copyBlob, 'Copied. Paste it into Discord.')}
              >
                {busy ? 'Pressing…' : 'Copy for Discord'}
              </button>
            )}
            <button
              className="btn"
              disabled={busy}
              onClick={() => withBlob(b => downloadBlob(b, `dark-cup-${slugify(doc.title)}.png`), 'Delivered.')}
            >
              Download PNG
            </button>
            <button className="btn ghost" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-desk desk">
          <ParchmentPage entry={doc} styleKey={styleKey}>{children}</ParchmentPage>
        </div>
        <div className="capture-stage" aria-hidden="true">
          <ParchmentPage ref={captureRef} entry={doc} styleKey={styleKey} exporting>{children}</ParchmentPage>
        </div>
      </div>
    </div>
  )
}
