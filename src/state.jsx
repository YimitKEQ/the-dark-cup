import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { api } from './api.js'
import { isStaticHost, loadVaultConfig, saveVaultConfig, clearVaultConfig, createVaultStore, fetchVault, putVault, normalize } from './vault.js'
import { makeDemoDb } from './demo.js'
import { trackWrite } from './busy.js'

// The Showcase: an in-memory book of invented records. Visitors can poke at
// everything; none of it is written anywhere.
function createDemoStore (doc) {
  const uid = () => 'demo-' + Math.random().toString(36).slice(2, 10)
  const now = () => new Date().toISOString()
  return {
    async data () { return doc },
    async create (col, fields) {
      const clean = normalize[col] ? normalize[col](fields) : fields
      const item = { id: uid(), ...clean, createdAt: now(), updatedAt: now() }
      doc[col].unshift(item)
      return item
    },
    async update (col, id, fields) {
      const i = doc[col].findIndex(x => x.id === id)
      if (i === -1) throw new Error('That record is no longer in the book.')
      const clean = normalize[col] ? normalize[col](fields) : fields
      doc[col][i] = { ...doc[col][i], ...clean, id: doc[col][i].id, createdAt: doc[col][i].createdAt, updatedAt: now() }
      return doc[col][i]
    },
    async remove (col, id) {
      doc[col] = doc[col].filter(x => x.id !== id)
      return { ok: true }
    },
    async importAll (next) {
      for (const key of ['people', 'journal', 'cases', 'poison', 'quicknotes']) {
        doc[key] = Array.isArray(next[key]) ? next[key] : []
      }
      return { ...doc }
    }
  }
}

function wantsShowcase () {
  return window.location.hash.replace(/^#\/?/, '').split('/')[0] === 'showcase'
}

const DataContext = createContext(null)

export function useData () {
  return useContext(DataContext)
}

// Two ways to keep the book: 'server' (local Express writing data/darkcup.json)
// and 'vault' (a private GitHub repository via the Contents API, used when the
// app is served from GitHub Pages). Same records, same shape, different shelf.
const serverStore = {
  data: api.data,
  create: api.create,
  update: api.update,
  remove: api.remove,
  importAll: api.importAll
}

export function DataProvider ({ children }) {
  const [db, setDb] = useState(null)
  const [mode, setMode] = useState(null)
  const [error, setError] = useState(null)
  const storeRef = useRef(serverStore)

  const enterDemo = useCallback(() => {
    const doc = makeDemoDb()
    storeRef.current = createDemoStore(doc)
    setDb(doc)
    setError(null)
    setMode('demo')
  }, [])

  const load = useCallback(async () => {
    setError(null)
    if (wantsShowcase()) {
      enterDemo()
      return
    }
    if (!isStaticHost()) {
      storeRef.current = serverStore
      try {
        setDb(await serverStore.data())
        setMode('server')
      } catch (e) {
        setError(e.message)
      }
      return
    }
    const cfg = loadVaultConfig()
    if (!cfg) {
      setMode('vault-setup')
      return
    }
    try {
      const store = createVaultStore(cfg)
      storeRef.current = store
      setDb(await store.data())
      setMode('vault')
    } catch (e) {
      setError(e.message)
      setMode('vault-setup')
    }
  }, [enterDemo])

  useEffect(() => { load() }, [load])

  const replaceIn = (col, item) => {
    setDb(prev => ({
      ...prev,
      [col]: prev[col].map(x => (x.id === item.id ? item : x))
    }))
  }

  const crud = (col) => ({
    async add (fields) {
      const item = await trackWrite(storeRef.current.create(col, fields))
      setDb(prev => ({ ...prev, [col]: [item, ...prev[col]] }))
      return item
    },
    async update (record) {
      const item = await trackWrite(storeRef.current.update(col, record.id, record))
      replaceIn(col, item)
      return item
    },
    async remove (recordId) {
      await trackWrite(storeRef.current.remove(col, recordId))
      setDb(prev => ({ ...prev, [col]: prev[col].filter(x => x.id !== recordId) }))
    }
  })

  const people = crud('people')
  const journal = crud('journal')
  const cases = crud('cases')
  const poison = crud('poison')
  const quicknotes = crud('quicknotes')

  const actions = {
    reload: load,
    enterDemo,
    exitDemo () {
      setDb(null)
      setMode(null)
      const h = window.location.hash
      if (h.startsWith('#/showcase')) window.location.hash = '#/'
      load()
    },
    async bindVault (cfg) {
      const existing = await fetchVault(cfg)
      if (!existing) {
        await putVault(cfg, {
          version: 1, people: [], journal: [], cases: [], poison: [], quicknotes: [], updatedAt: new Date().toISOString()
        }, null, 'begin the book')
      }
      saveVaultConfig(cfg)
      const store = createVaultStore(cfg)
      storeRef.current = store
      setDb(await store.data())
      setError(null)
      setMode('vault')
    },
    unbindVault () {
      clearVaultConfig()
      storeRef.current = serverStore
      setDb(null)
      setMode('vault-setup')
    },

    addPerson: people.add,
    updatePerson: people.update,
    deletePerson: people.remove,
    async addNote (person, note) {
      const next = { ...person, notes: [{ ...note, createdAt: new Date().toISOString() }, ...person.notes] }
      return people.update(next)
    },
    async updateNote (person, noteId, patch) {
      const next = {
        ...person,
        notes: person.notes.map(n =>
          n.id === noteId ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)
      }
      return people.update(next)
    },
    async deleteNote (person, noteId) {
      return people.update({ ...person, notes: person.notes.filter(n => n.id !== noteId) })
    },
    async addTie (person, tie) {
      const next = { ...person, ties: [...(person.ties || []), tie] }
      return people.update(next)
    },
    async deleteTie (person, tieId) {
      return people.update({ ...person, ties: (person.ties || []).filter(t => t.id !== tieId) })
    },

    addJournal: journal.add,
    updateJournal: journal.update,
    deleteJournal: journal.remove,

    addCase: cases.add,
    updateCase: cases.update,
    deleteCase: cases.remove,

    addPoison: poison.add,
    updatePoison: poison.update,
    deletePoison: poison.remove,

    addQuick: quicknotes.add,
    deleteQuick: quicknotes.remove,

    async importAll (doc) {
      const next = await trackWrite(storeRef.current.importAll(doc))
      setDb(next)
      return next
    }
  }

  return (
    <DataContext.Provider value={{ db, error, mode, ...actions }}>
      {children}
    </DataContext.Provider>
  )
}
