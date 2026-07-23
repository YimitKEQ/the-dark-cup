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

  const actions = {
    reload: load,

    async addPerson (fields) {
      const item = await api.create('people', fields)
      setDb(prev => ({ ...prev, people: [item, ...prev.people] }))
      return item
    },
    async updatePerson (person) {
      const item = await api.update('people', person.id, person)
      replaceIn('people', item)
      return item
    },
    async deletePerson (personId) {
      await api.remove('people', personId)
      setDb(prev => ({ ...prev, people: prev.people.filter(p => p.id !== personId) }))
    },
    async addNote (person, note) {
      const next = { ...person, notes: [{ ...note, createdAt: new Date().toISOString() }, ...person.notes] }
      const item = await api.update('people', person.id, next)
      replaceIn('people', item)
      return item
    },
    async updateNote (person, noteId, patch) {
      const next = {
        ...person,
        notes: person.notes.map(n =>
          n.id === noteId ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)
      }
      const item = await api.update('people', person.id, next)
      replaceIn('people', item)
      return item
    },
    async deleteNote (person, noteId) {
      const next = { ...person, notes: person.notes.filter(n => n.id !== noteId) }
      const item = await api.update('people', person.id, next)
      replaceIn('people', item)
      return item
    },

    async addJournal (fields) {
      const item = await api.create('journal', fields)
      setDb(prev => ({ ...prev, journal: [item, ...prev.journal] }))
      return item
    },
    async updateJournal (entry) {
      const item = await api.update('journal', entry.id, entry)
      replaceIn('journal', item)
      return item
    },
    async deleteJournal (entryId) {
      await api.remove('journal', entryId)
      setDb(prev => ({ ...prev, journal: prev.journal.filter(e => e.id !== entryId) }))
    },

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
