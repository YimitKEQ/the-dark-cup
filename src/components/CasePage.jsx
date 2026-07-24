import { useEffect, useState } from 'react'
import { useData } from '../state.jsx'
import { CASE_STEPS, CASE_STATUS, caseStepLabel, roman, formatRealDate, timeAgo } from '../lore.js'
import { go } from '../App.jsx'
import { toast } from '../toast.js'
import ConfirmButton from './ConfirmButton.jsx'
import ParchmentModal from './ParchmentModal.jsx'

// Suggest the natural next rung of the ladder based on the last step taken.
function nextStepType (theCase) {
  const last = theCase.steps[theCase.steps.length - 1]
  if (!last) return 'contact'
  const order = ['contact', 'warning', 'pressure', 'mercy', 'escalation', 'resolution']
  const i = order.indexOf(last.type)
  if (i === -1 || i === order.length - 1) return last.type === 'resolution' ? 'other' : 'contact'
  return order[i + 1]
}

function StepComposer ({ theCase }) {
  const { updateCase } = useData()
  const [type, setType] = useState(() => nextStepType(theCase))
  const stepCount = theCase.steps.length
  useEffect(() => { setType(nextStepType(theCase)) }, [stepCount]) // eslint-disable-line react-hooks/exhaustive-deps
  const [text, setText] = useState('')
  const [witnesses, setWitnesses] = useState('')
  const [worldDate, setWorldDate] = useState('')
  const [busy, setBusy] = useState(false)

  async function save () {
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      const step = {
        type,
        text: text.trim(),
        witnesses: witnesses.trim(),
        worldDate: worldDate.trim(),
        createdAt: new Date().toISOString()
      }
      await updateCase({ ...theCase, steps: [...theCase.steps, step] })
      setText(''); setWitnesses(''); setWorldDate('')
      toast('Step recorded.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="composer step-composer">
      <div className="step-composer-row">
        <select value={type} onChange={e => setType(e.target.value)}>
          {CASE_STEPS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <input placeholder="In-world date, if it matters" value={worldDate} onChange={e => setWorldDate(e.target.value)} />
      </div>
      <textarea
        rows={3}
        placeholder="What was done, and how they took it…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') save() }}
      />
      <div className="composer-foot">
        <input className="witness-field" placeholder="Witnesses, if any" value={witnesses} onChange={e => setWitnesses(e.target.value)} />
        <button className="btn primary" disabled={!text.trim() || busy} onClick={save}>Record the step</button>
      </div>
    </div>
  )
}

function buildParchmentDoc (theCase, person) {
  const title = theCase.title || (person ? `Against ${person.name}` : 'An unnamed matter')
  const statusLabel = CASE_STATUS.find(s => s.key === theCase.status)?.label || 'Open'
  const paragraphs = theCase.steps.map((s, i) => {
    const head = `${roman(i + 1)}. ${caseStepLabel(s.type)}${s.worldDate ? `, ${s.worldDate}` : ''}.`
    const witness = s.witnesses ? `\nWitnessed by ${s.witnesses}.` : ''
    return `${head}\n${s.text}${witness}`
  })
  if (person) {
    paragraphs.unshift(`Concerning ${person.name}${person.role ? `, ${person.role}` : ''}. The matter stands ${statusLabel.toLowerCase()}.`)
  }
  return { title, month: '', year: '', day: null, body: paragraphs.join('\n\n') }
}

export default function CasePage ({ caseId }) {
  const { db, updateCase, deleteCase, importAll } = useData()
  const [exporting, setExporting] = useState(false)

  const theCase = db.cases.find(c => c.id === caseId)
  if (!theCase) {
    return <p className="empty">No such case in the records. <a href="#/cases">Back to the cases.</a></p>
  }

  const person = db.people.find(p => p.id === theCase.personId)

  async function removeStep (stepId) {
    const snap = db
    await updateCase({ ...theCase, steps: theCase.steps.filter(s => s.id !== stepId) })
    toast('Struck.', { label: 'Undo', fn: () => importAll(snap) })
  }

  return (
    <section>
      <a className="crumb" href="#/cases">← The Cases</a>

      <header className="page-head person-head">
        <h1>{theCase.title || (person ? `Against ${person.name}` : 'Unnamed matter')}</h1>
        <p className="page-sub">
          {person
            ? <>Against <a href={`#/person/${person.id}`}>{person.name}</a>{person.role ? `, ${person.role}` : ''}.</>
            : 'No target named in the ledger.'}
        </p>
        <div className="head-actions">
          <div className="tag-row">
            {CASE_STATUS.map(s => (
              <button
                key={s.key}
                className={`tag status-${s.key}` + (theCase.status === s.key ? ' on' : '')}
                onClick={() => updateCase({ ...theCase, status: s.key })}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => setExporting(true)}>Export parchment</button>
          <ConfirmButton
            className="link-btn danger"
            label="burn the file"
            confirmLabel="burn it, truly?"
            onConfirm={async () => {
              const snap = db
              await deleteCase(theCase.id)
              toast('Burned.', { label: 'Undo', fn: () => importAll(snap) })
              go('/cases')
            }}
          />
        </div>
      </header>

      <StepComposer theCase={theCase} />

      {theCase.steps.length === 0 && (
        <p className="empty">No steps taken yet. Begin gently.</p>
      )}

      <ol className="case-timeline">
        {theCase.steps.map((s, i) => (
          <li key={s.id} className="case-step">
            <span className="case-node">{roman(i + 1)}</span>
            <div className="case-step-body">
              <div className="case-step-head">
                <span className="case-step-type">{caseStepLabel(s.type)}</span>
                {s.worldDate && <span className="case-step-date">{s.worldDate}</span>}
                <span className="note-time" title={formatRealDate(s.createdAt)}>{timeAgo(s.createdAt)}</span>
                <span className="note-actions">
                  <ConfirmButton
                    className="link-btn danger"
                    label="strike"
                    confirmLabel="strike it?"
                    onConfirm={() => removeStep(s.id)}
                  />
                </span>
              </div>
              <p className="note-text">{s.text}</p>
              {s.witnesses && <p className="case-witnesses">Witnessed by {s.witnesses}</p>}
            </div>
          </li>
        ))}
      </ol>

      {exporting && (
        <ParchmentModal
          doc={buildParchmentDoc(theCase, person)}
          initialStyle="seal"
          onClose={() => setExporting(false)}
        />
      )}
    </section>
  )
}
