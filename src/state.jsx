import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { api } from './api.js'
import { isStaticHost, loadVaultConfig, saveVaultConfig, clearVaultConfig, createVaultStore, fetchVault, putVault } from './vault.js'

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

  const load = useCallback(async () => {
    setError(null)
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
  }, [])

  useEffect(() => { load() }, [load])

  const replaceIn = (col, item) => {
    setDb(prev => ({
      ...prev,
      [col]: prev[col].map(x => (x.id === item.id ? item : x))
    }))
  }

  const crud = (col) => ({
    async add (fields) {
      const item = await storeRef.current.create(col, fields)
      setDb(prev => ({ ...prev, [col]: [item, ...prev[col]] }))
      return item
    },
    async update (record) {
      const item = await storeRef.current.update(col, record.id, record)
      replaceIn(col, item)
      return item
    },
    async remove (recordId) {
      await storeRef.current.remove(col, recordId)
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
      const next = await storeRef.current.importAll(doc)
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
