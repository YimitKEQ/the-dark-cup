import { useMemo, useState } from 'react'
import { useData } from '../state.jsx'
import { formatRealDate, formatWorldDate, todayWorldDate, timeAgo } from '../lore.js'
import { toast } from '../toast.js'
import ConfirmButton from './ConfirmButton.jsx'

function DoseChart ({ entries }) {
  const points = useMemo(() => {
    return entries
      .filter(e => e.dose !== null && e.dose !== undefined)
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }, [entries])

  if (points.length < 2) return null

  const W = 760
  const H = 220
  const PAD = { top: 18, right: 22, bottom: 34, left: 46 }
  const maxDose = Math.max(...points.map(p => p.dose))
  const minDose = Math.min(...points.map(p => p.dose), 0)
  const span = maxDose - minDose || 1
  const x = (i) => PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right)
  const y = (d) => PAD.top + (1 - (d - minDose) / span) * (H - PAD.top - PAD.bottom)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.dose).toFixed(1)}`).join(' ')
  const gridLines = [0.25, 0.5, 0.75].map(f => PAD.top + f * (H - PAD.top - PAD.bottom))
  const unit = points.find(p => p.unit)?.unit || ''

  return (
    <div className="chart-wrap">
      <svg className="dose-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dose over time">
        {gridLines.map((gy, i) => (
          <line key={i} x1={PAD.left} y1={gy} x2={W - PAD.right} y2={gy} className="chart-grid" />
        ))}
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} className="chart-axis" />
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} className="chart-axis" />
        <text x={PAD.left - 8} y={y(maxDose) + 4} className="chart-label" textAnchor="end">{maxDose}</text>
        <text x={PAD.left - 8} y={H - PAD.bottom + 4} className="chart-label" textAnchor="end">{minDose}</text>
        <text x={PAD.left} y={H - 10} className="chart-label" textAnchor="start">
          {points[0].dateText || formatRealDate(points[0].createdAt, false)}
        </text>
        <text x={W - PAD.right} y={H - 10} className="chart-label" textAnchor="end">
          {points[points.length - 1].dateText || formatRealDate(points[points.length - 1].createdAt, false)}
        </text>
        {unit && <text x={PAD.left} y={12} className="chart-label" textAnchor="start">{unit}</text>}
        <path d={path} className="chart-line" />
        {points.map((p, i) => (
          <circle key={p.id} cx={x(i)} cy={y(p.dose)} r="3.4" className="chart-dot">
            <title>{`${p.dose}${p.unit ? ' ' + p.unit : ''} · ${p.dateText || formatRealDate(p.createdAt, false)}${p.effect ? ' · ' + p.effect : ''}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  )
}

export default function Poison () {
  const { db, addPoison, updatePoison, deletePoison, importAll } = useData()
  const [f, setF] = useState({ dateText: formatWorldDate(todayWorldDate()), dose: '', unit: 'drops', effect: '', note: '' })
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setF(v => ({ ...v, [k]: e.target.value }))
  const canSave = (f.dose !== '' || f.effect.trim()) && !busy

  async function save () {
    if (!canSave) return
    setBusy(true)
    try {
      const payload = {
        dateText: f.dateText.trim(),
        dose: f.dose === '' ? null : Number(f.dose),
        unit: f.unit.trim(),
        effect: f.effect.trim(),
        note: f.note.trim()
      }
      if (editingId) {
        const existing = db.poison.find(p => p.id === editingId)
        await updatePoison({ ...existing, ...payload })
        toast('Amended.')
      } else {
        await addPoison(payload)
        toast('Dose recorded.')
      }
      setF({ dateText: formatWorldDate(todayWorldDate()), dose: '', unit: f.unit, effect: '', note: '' })
      setEditingId(null)
    } finally {
      setBusy(false)
    }
  }

  function startEdit (p) {
    setEditingId(p.id)
    setF({
      dateText: p.dateText || '',
      dose: p.dose === null || p.dose === undefined ? '' : String(p.dose),
      unit: p.unit || '',
      effect: p.effect || '',
      note: p.note || ''
    })
  }

  return (
    <section>
      <header className="page-head">
        <h1>The Poison Log</h1>
        <p className="page-sub">Drop by drop. The work is patient, and so am I.</p>
      </header>

      <div className="composer poison-form">
        <div className="poison-form-row">
          <input className="poison-date" placeholder="In-world date" value={f.dateText} onChange={set('dateText')} />
          <input className="poison-dose" type="number" step="any" placeholder="Dose" value={f.dose} onChange={set('dose')} />
          <input className="poison-unit" placeholder="Unit" value={f.unit} onChange={set('unit')} />
          <input className="poison-effect" placeholder="Observed effect" value={f.effect} onChange={set('effect')} />
        </div>
        <textarea rows={2} placeholder="A note, if the night calls for one" value={f.note} onChange={set('note')} />
        <div className="composer-foot">
          {editingId && (
            <button className="btn ghost" onClick={() => { setEditingId(null); setF({ dateText: formatWorldDate(todayWorldDate()), dose: '', unit: 'drops', effect: '', note: '' }) }}>
              Leave it
            </button>
          )}
          <button className="btn primary" disabled={!canSave} onClick={save}>
            {editingId ? 'Amend the entry' : 'Record the dose'}
          </button>
        </div>
      </div>

      <DoseChart entries={db.poison} />

      {db.poison.length === 0 && (
        <p className="empty">Nothing administered yet. The vial waits.</p>
      )}

      <ul className="poison-list">
        {db.poison.map(p => (
          <li key={p.id} className="poison-row">
            <div className="poison-row-head">
              <span className="poison-row-date">{p.dateText || formatRealDate(p.createdAt, false)}</span>
              {p.dose !== null && p.dose !== undefined && (
                <span className="poison-row-dose">{p.dose}{p.unit ? ` ${p.unit}` : ''}</span>
              )}
              <span className="note-time" title={formatRealDate(p.createdAt)}>{timeAgo(p.createdAt)}</span>
              <span className="note-actions">
                <button className="link-btn" onClick={() => startEdit(p)}>amend</button>
                <ConfirmButton
                  className="link-btn danger"
                  label="strike"
                  confirmLabel="strike it?"
                  onConfirm={async () => {
                    const snap = db
                    await deletePoison(p.id)
                    toast('Struck.', { label: 'Undo', fn: () => importAll(snap) })
                  }}
                />
              </span>
            </div>
            {p.effect && <p className="note-text">{p.effect}</p>}
            {p.note && <p className="poison-note">{p.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
