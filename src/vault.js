// The Vault: the book stored as darkcup.json in a private GitHub repository,
// read and written through the Contents API. Every save is a commit, so the
// vault keeps every version of the record forever.

const CONFIG_KEY = 'darkcup-vault-config'
const API = 'https://api.github.com'

export function loadVaultConfig () {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    const cfg = raw ? JSON.parse(raw) : null
    return cfg && cfg.owner && cfg.repo && cfg.token ? cfg : null
  } catch {
    return null
  }
}

export function saveVaultConfig (cfg) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
}

export function clearVaultConfig () {
  localStorage.removeItem(CONFIG_KEY)
}

export function isStaticHost () {
  return /\.github\.io$/.test(window.location.hostname)
}

function encodeDoc (doc) {
  const bytes = new TextEncoder().encode(JSON.stringify(doc, null, 2))
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  }
  return btoa(bin)
}

function decodeContent (b64) {
  const bin = atob(b64.replace(/\s/g, ''))
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

function fileUrl (cfg) {
  const path = cfg.path || 'darkcup.json'
  return `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}`
}

function headers (cfg) {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}

async function ghError (res, fallback) {
  let detail = ''
  try { detail = (await res.json()).message || '' } catch { /* not json */ }
  const err = new Error(detail || fallback)
  err.status = res.status
  return err
}

export async function fetchRepoMeta (cfg) {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}`, { headers: headers(cfg) })
  if (!res.ok) {
    throw await ghError(res,
      'The vault could not be found, or the key cannot see it. Check the repository name and the token’s access.')
  }
  return res.json()
}

// Fail closed: the book never goes into a repository the whole world can read.
export async function assertPrivateVault (cfg) {
  const meta = await fetchRepoMeta(cfg)
  if (!meta.private) {
    throw new Error(
      `${cfg.owner}/${cfg.repo} is a PUBLIC repository; anyone could read the book. ` +
      'Bind the vault to a private repository such as darkcup-vault.')
  }
  return meta
}

export async function fetchVault (cfg) {
  const res = await fetch(fileUrl(cfg), { headers: headers(cfg) })
  if (res.status === 404) return null
  if (!res.ok) throw await ghError(res, `The vault would not open (${res.status}).`)
  const body = await res.json()
  return { doc: decodeContent(body.content), sha: body.sha }
}

export async function putVault (cfg, doc, sha, message) {
  const body = { message, content: encodeDoc(doc) }
  if (sha) body.sha = sha
  const res = await fetch(fileUrl(cfg), {
    method: 'PUT',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw await ghError(res, `The vault refused the entry (${res.status}).`)
  return (await res.json()).content.sha
}

const EMPTY = () => ({
  version: 1,
  people: [],
  journal: [],
  cases: [],
  poison: [],
  quicknotes: []
})

const now = () => new Date().toISOString()
const uid = () => (crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`)

// The server assigns ids and timestamps to nested records; in vault mode the
// client must do the same so both books stay the same shape.
export const normalize = {
  people (item) {
    return {
      ...item,
      notes: (item.notes || []).map(n => ({
        ...n, id: n.id || uid(), tags: n.tags || [], createdAt: n.createdAt || now()
      })),
      ties: (item.ties || []).map(t => ({ ...t, id: t.id || uid() }))
    }
  },
  cases (item) {
    return {
      ...item,
      steps: (item.steps || []).map(s => ({ ...s, id: s.id || uid(), createdAt: s.createdAt || now() }))
    }
  }
}

function heal (doc) {
  const base = EMPTY()
  for (const key of Object.keys(base)) {
    if (!Array.isArray(doc[key])) doc[key] = base[key]
  }
  return doc
}

export function createVaultStore (cfg) {
  let chain = Promise.resolve()
  // The last known state of the file, so the usual save is one request
  // instead of two. A 409 (someone else wrote meanwhile) drops the cache,
  // refetches, and reapplies the change.
  let cache = null

  function mutate (message, fn) {
    const run = async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        let doc, sha
        if (attempt === 0 && cache) {
          doc = structuredClone(cache.doc)
          sha = cache.sha
        } else {
          const cur = await fetchVault(cfg)
          doc = heal(cur ? cur.doc : EMPTY())
          sha = cur ? cur.sha : null
        }
        const result = fn(doc)
        doc.updatedAt = now()
        try {
          const newSha = await putVault(cfg, doc, sha, message)
          cache = { doc: structuredClone(doc), sha: newSha }
          return result
        } catch (err) {
          cache = null
          if (err.status !== 409 || attempt === 1) throw err
        }
      }
    }
    const p = chain.then(run, run)
    chain = p.catch(() => {})
    return p
  }

  return {
    async data () {
      await assertPrivateVault(cfg)
      const cur = await fetchVault(cfg)
      if (!cur) {
        const doc = { ...EMPTY(), updatedAt: now() }
        const sha = await putVault(cfg, doc, null, 'begin the book')
        cache = { doc: structuredClone(doc), sha }
        return doc
      }
      const doc = heal(cur.doc)
      cache = { doc: structuredClone(doc), sha: cur.sha }
      return doc
    },

    create (col, fields) {
      return mutate(`record: new entry in ${col}`, doc => {
        const clean = normalize[col] ? normalize[col](fields) : fields
        const item = { id: uid(), ...clean, createdAt: now(), updatedAt: now() }
        doc[col].unshift(item)
        return item
      })
    },

    update (col, id, fields) {
      return mutate(`record: amend ${col}`, doc => {
        const i = doc[col].findIndex(x => x.id === id)
        if (i === -1) throw new Error('That record is no longer in the book.')
        const clean = normalize[col] ? normalize[col](fields) : fields
        doc[col][i] = {
          ...doc[col][i],
          ...clean,
          id: doc[col][i].id,
          createdAt: doc[col][i].createdAt,
          updatedAt: now()
        }
        return doc[col][i]
      })
    },

    remove (col, id) {
      return mutate(`record: strike from ${col}`, doc => {
        const i = doc[col].findIndex(x => x.id === id)
        if (i === -1) throw new Error('That record is no longer in the book.')
        doc[col].splice(i, 1)
        return { ok: true }
      })
    },

    importAll (next) {
      return mutate('restore the book from a carried copy', doc => {
        const base = EMPTY()
        for (const key of Object.keys(base)) {
          doc[key] = Array.isArray(next[key]) ? next[key] : []
        }
        doc.version = 1
        return doc
      })
    }
  }
}
