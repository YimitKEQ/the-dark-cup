import { useMemo, useRef, useState } from 'react'
import { useData } from '../state.jsx'
import { loadVaultConfig } from '../vault.js'
import { timeAgo } from '../lore.js'
import { toast } from '../toast.js'
import ConfirmButton from './ConfirmButton.jsx'

const EXPORT_STAMP_KEY = 'darkcup-last-export'
// The GitHub Contents API stops returning file content past 1 MB.
const VAULT_CEILING = 1000000
const VAULT_WORRY = 700000

export default function Archive () {
  const { db, mode, importAll, unbindVault } = useData()
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
      setMessage({ kind: 'ok', text: 'The records have been restored.' })
      toast('Restored.')
    } catch (err) {
      setMessage({ kind: 'error', text: err.message })
    }
  }

  function markExported () {
    try { localStorage.setItem(EXPORT_STAMP_KEY, new Date().toISOString()) } catch { /* fine */ }
  }

  function exportLocal () {
    const stamp = new Date().toISOString().slice(0, 10)
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `darkcup-export-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 30000)
    markExported()
  }

  const lastExport = (() => {
    try { return localStorage.getItem(EXPORT_STAMP_KEY) } catch { return null }
  })()

  const counts = [
    `${db.people.length} people`,
    `${db.people.reduce((n, p) => n + p.notes.length, 0)} ledger notes`,
    `${db.journal.length} journal entries`,
    `${db.cases.length} cases`,
    `${db.poison.length} doses`,
    `${db.quicknotes.length} quick notes`
  ].join(' · ')

  const weight = useMemo(() => JSON.stringify(db).length, [db])
  const vaultCfg = mode === 'vault' ? loadVaultConfig() : null

  return (
    <section>
      <header className="page-head">
        <h1>The Archive</h1>
        <p className="page-sub">Where the book itself is kept safe.</p>
      </header>

      <div className="archive-block">
        <h2>What the book holds</h2>
        <p>{counts}</p>
        {mode === 'server' && (
          <p className="detail">
            Everything lives on this machine, in <code>data/darkcup.json</code>. Each time the app starts,
            a dated copy is set aside in <code>data/backups</code>; the last twenty are kept.
          </p>
        )}
        {mode === 'vault' && vaultCfg && (
          <p className="detail">
            Everything lives in the vault: <code>{vaultCfg.owner}/{vaultCfg.repo}</code>, a private
            repository. Every change is a sealed commit, so the vault remembers every version of the
            book there has ever been. The key stays in this browser.
          </p>
        )}
        <p className="detail">
          The book weighs {(weight / 1024).toFixed(1)} KB of ink.
          {mode === 'vault' && weight > VAULT_WORRY && (
            <strong> It nears the vault&apos;s limit of {(VAULT_CEILING / 1024).toFixed(0)} KB;
            consider retiring old records to a carried copy.</strong>
          )}
        </p>
      </div>

      <div className="archive-block">
        <h2>Carry a copy out</h2>
        <p className="detail">
          A single file holding every record, fit for keeping somewhere safe.
          {' '}{lastExport ? `Last carried out ${timeAgo(lastExport)}.` : 'No copy has ever been carried out from this device.'}
        </p>
        {mode === 'server'
          ? <a className="btn primary" href="/api/export" download onClick={markExported}>Export everything</a>
          : <button className="btn primary" onClick={exportLocal}>Export everything</button>}
      </div>

      <div className="archive-block">
        <h2>Restore from a copy</h2>
        <p className="detail">
          This replaces the entire book with the file you choose.
          {mode === 'server' ? ' The current book is backed up first.' : ' The vault keeps the old version in its history.'}
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

      {mode === 'vault' && (
        <div className="archive-block">
          <h2>Unbind this device</h2>
          <p className="detail">
            Forgets the key on this browser only. The vault and everything in it remain untouched.
          </p>
          <ConfirmButton
            className="btn danger"
            label="Unbind"
            confirmLabel="Unbind, truly?"
            onConfirm={() => { unbindVault(); toast('Unbound.') }}
          />
        </div>
      )}
    </section>
  )
}
