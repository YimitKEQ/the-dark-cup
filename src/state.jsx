import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from './api.js'

const DataContext = createContext(null)

export function useData () {
  return useContext(DataContext)
}

export function DataProvider ({ children }) {
  const [db, setDb] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setError(null)
    api.data().then(setDb).catch(e => setError(e.message))
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
      const item = await api.create(col, fields)
      setDb(prev => ({ ...prev, [col]: [item, ...prev[col]] }))
      return item
    },
    async update (record) {
      const item = await api.update(col, record.id, record)
      replaceIn(col, item)
      return item
    },
    async remove (recordId) {
      await api.remove(col, recordId)
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
      const next = await api.importAll(doc)
      setDb(next)
      return next
    }
  }

  return (
    <DataContext.Provider value={{ db, error, ...actions }}>
      {children}
    </DataContext.Provider>
  )
}
