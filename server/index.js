import express from 'express'
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { init, getDoc, mutate, replaceAll } from './store.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const PORT = process.env.PORT || 4201
const TAG_KEYS = ['debt', 'secret', 'threat', 'favour', 'ally']
const CASE_STEP_KEYS = ['contact', 'warning', 'pressure', 'mercy', 'escalation', 'resolution', 'other']
const TIE_KEYS = ['kin', 'ally', 'rival', 'enemy', 'debt', 'informant', 'patron']

const str = (v, max = 4000) => (typeof v === 'string' ? v.slice(0, max).trim() : '')
const longStr = (v) => (typeof v === 'string' ? v.slice(0, 200000) : '')
const now = () => new Date().toISOString()
const id = () => crypto.randomUUID()

function sanitizeNote (n) {
  if (!n || typeof n !== 'object') return null
  const text = longStr(n.text).trim()
  if (!text) return null
  return {
    id: str(n.id, 64) || id(),
    text,
    tags: Array.isArray(n.tags) ? n.tags.filter(t => TAG_KEYS.includes(t)) : [],
    createdAt: str(n.createdAt, 40) || now(),
    updatedAt: str(n.updatedAt, 40) || undefined
  }
}

const validators = {
  people (b) {
    const name = str(b.name, 200)
    if (!name) return null
    const sanitizeTie = (t) => {
      if (!t || typeof t !== 'object') return null
      const personId = str(t.personId, 64)
      if (!personId) return null
      return {
        id: str(t.id, 64) || id(),
        personId,
        kind: TIE_KEYS.includes(t.kind) ? t.kind : 'ally',
        note: str(t.note, 500)
      }
    }
    return {
      name,
      role: str(b.role, 300),
      allegiance: str(b.allegiance, 300),
      metAt: str(b.metAt, 300),
      notes: Array.isArray(b.notes) ? b.notes.map(sanitizeNote).filter(Boolean) : [],
      ties: Array.isArray(b.ties) ? b.ties.map(sanitizeTie).filter(Boolean) : []
    }
  },
  journal (b) {
    const title = str(b.title, 300)
    const body = longStr(b.body)
    if (!title && !body.trim()) return null
    const day = Number.isInteger(b.day) && b.day >= 1 && b.day <= 31 ? b.day : null
    return {
      title,
      body,
      day,
      month: str(b.month, 40),
      year: str(b.year, 40),
      style: str(b.style, 40) || 'court',
      personIds: Array.isArray(b.personIds) ? b.personIds.map(v => str(v, 64)).filter(Boolean) : []
    }
  },
  quicknotes (b) {
    const text = longStr(b.text).trim()
    if (!text) return null
    return { text }
  },
  cases (b) {
    const personId = str(b.personId, 64)
    const title = str(b.title, 300)
    if (!personId && !title) return null
    const sanitizeStep = (s) => {
      if (!s || typeof s !== 'object') return null
      const text = longStr(s.text).trim()
      if (!text) return null
      return {
        id: str(s.id, 64) || id(),
        type: CASE_STEP_KEYS.includes(s.type) ? s.type : 'contact',
        text,
        witnesses: str(s.witnesses, 500),
        worldDate: str(s.worldDate, 120),
        createdAt: str(s.createdAt, 40) || now()
      }
    }
    return {
      personId,
      title,
      status: ['open', 'resolved', 'abandoned'].includes(b.status) ? b.status : 'open',
      steps: Array.isArray(b.steps) ? b.steps.map(sanitizeStep).filter(Boolean) : []
    }
  },
  poison (b) {
    const dose = Number(b.dose)
    const effect = str(b.effect, 2000)
    if (!Number.isFinite(dose) && !effect) return null
    return {
      dateText: str(b.dateText, 120),
      dose: Number.isFinite(dose) ? dose : null,
      unit: str(b.unit, 40),
      effect,
      note: longStr(b.note)
    }
  }
}

init()
const app = express()
app.use(express.json({ limit: '20mb' }))

app.get('/api/data', (req, res) => res.json(getDoc()))

app.post('/api/:col', (req, res) => {
  const validate = validators[req.params.col]
  if (!validate) return res.status(404).json({ error: 'unknown collection' })
  const clean = validate(req.body || {})
  if (!clean) return res.status(400).json({ error: 'invalid or empty record' })
  const item = { id: id(), ...clean, createdAt: now(), updatedAt: now() }
  mutate(doc => doc[req.params.col].unshift(item))
  res.json(item)
})

app.put('/api/:col/:id', (req, res) => {
  const validate = validators[req.params.col]
  if (!validate) return res.status(404).json({ error: 'unknown collection' })
  const clean = validate(req.body || {})
  if (!clean) return res.status(400).json({ error: 'invalid or empty record' })
  const updated = mutate(doc => {
    const list = doc[req.params.col]
    const i = list.findIndex(x => x.id === req.params.id)
    if (i === -1) return null
    list[i] = { ...list[i], ...clean, id: list[i].id, createdAt: list[i].createdAt, updatedAt: now() }
    return list[i]
  })
  if (!updated) return res.status(404).json({ error: 'not found' })
  res.json(updated)
})

app.delete('/api/:col/:id', (req, res) => {
  if (!validators[req.params.col]) return res.status(404).json({ error: 'unknown collection' })
  const removed = mutate(doc => {
    const list = doc[req.params.col]
    const i = list.findIndex(x => x.id === req.params.id)
    if (i === -1) return false
    list.splice(i, 1)
    return true
  })
  if (!removed) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true })
})

app.get('/api/export', (req, res) => {
  const stamp = new Date().toISOString().slice(0, 10)
  res.setHeader('Content-Disposition', `attachment; filename="darkcup-export-${stamp}.json"`)
  res.json(getDoc())
})

app.post('/api/import', (req, res) => {
  const b = req.body
  if (!b || typeof b !== 'object' || !Array.isArray(b.people) || !Array.isArray(b.journal)) {
    return res.status(400).json({ error: 'not a Dark Cup export file' })
  }
  const next = {
    version: 1,
    people: b.people,
    journal: b.journal,
    cases: Array.isArray(b.cases) ? b.cases : [],
    poison: Array.isArray(b.poison) ? b.poison : [],
    quicknotes: Array.isArray(b.quicknotes) ? b.quicknotes : []
  }
  res.json(replaceAll(next))
})

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`The Dark Cup keeps its records at http://localhost:${PORT}`)
})
