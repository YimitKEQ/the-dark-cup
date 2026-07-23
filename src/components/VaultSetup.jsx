import { useState } from 'react'
import { useData } from '../state.jsx'

export default function VaultSetup () {
  const { bindVault, error } = useData()
  const [owner, setOwner] = useState('YimitKEQ')
  const [repo, setRepo] = useState('darkcup-vault')
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState(null)

  const canBind = owner.trim() && repo.trim() && token.trim() && !busy

  async function bind (e) {
    e.preventDefault()
    if (!canBind) return
    setBusy(true)
    setFail(null)
    try {
      await bindVault({ owner: owner.trim(), repo: repo.trim(), token: token.trim(), path: 'darkcup.json' })
    } catch (err) {
      setFail(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="vault-setup">
      <header className="page-head">
        <h1>The Vault</h1>
        <p className="page-sub">
          This copy of the book lives in a private GitHub repository. Bind this device once and the
          records follow you anywhere.
        </p>
      </header>

      <div className="archive-block">
        <h2>Before binding</h2>
        <ol className="vault-steps">
          <li>
            Keep (or create) a <strong>private</strong> repository for the records, for example
            {' '}<code>darkcup-vault</code>. Nothing else goes in it.
          </li>
          <li>
            Create a <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">fine-grained access token</a>:
            grant it access to <em>only that repository</em>, with <strong>Contents: Read and write</strong>.
            Nothing more.
          </li>
          <li>Paste it below. The token stays in this browser only; it is never sent anywhere but GitHub.</li>
        </ol>
      </div>

      <form className="archive-block vault-form" onSubmit={bind}>
        <h2>Bind this device</h2>
        <div className="vault-fields">
          <label>
            <span>Account</span>
            <input value={owner} onChange={e => setOwner(e.target.value)} autoComplete="off" />
          </label>
          <label>
            <span>Repository</span>
            <input value={repo} onChange={e => setRepo(e.target.value)} autoComplete="off" />
          </label>
          <label>
            <span>Access token</span>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="github_pat_…"
              autoComplete="off"
            />
          </label>
        </div>
        <div className="form-row">
          <button className="btn primary" type="submit" disabled={!canBind}>
            {busy ? 'Turning the key…' : 'Bind the vault'}
          </button>
        </div>
        {(fail || error) && <p className="archive-msg error">{fail || error}</p>}
      </form>

      <p className="detail vault-note">
        If the repository is empty, a fresh book is begun. If it already holds records, they are
        opened as they stand. Every change becomes a sealed commit, so the vault remembers every
        version of the book there has ever been.
      </p>
    </section>
  )
}
