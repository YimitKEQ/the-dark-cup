import { useEffect, useRef, useState } from 'react'
import { useData } from '../state.jsx'
import { toast } from '../toast.js'

export default function QuickJot ({ onClose }) {
  const { addQuick } = useData()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  useEffect(() => { ref.current?.focus() }, [])

  async function save () {
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      await addQuick({ text: text.trim() })
      toast('Jotted down.')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  function onKeyDown (e) {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() }
  }

  return (
    <div className="palette-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="palette jot" onKeyDown={onKeyDown}>
        <div className="jot-head">A quick note, before it slips away</div>
        <textarea
          ref={ref}
          rows={3}
          placeholder="Write it. Enter saves, Shift+Enter for a new line."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="jot-foot">
          <span className="jot-hint">Kept under Quick Notes until you deal with it.</span>
          <button className="btn primary" disabled={!text.trim() || busy} onClick={save}>Jot it</button>
        </div>
      </div>
    </div>
  )
}
