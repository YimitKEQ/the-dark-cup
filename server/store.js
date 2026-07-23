import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, 'data')
const BACKUP_DIR = path.join(DATA_DIR, 'backups')
const FILE = path.join(DATA_DIR, 'darkcup.json')
const TMP = FILE + '.tmp'
const MAX_BACKUPS = 20

const EMPTY = () => ({
  version: 1,
  people: [],
  journal: [],
  cases: [],
  poison: [],
  quicknotes: [],
  updatedAt: new Date().toISOString()
})

let doc = null

function ensureDirs () {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

function backupOnStart () {
  if (!fs.existsSync(FILE)) return
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  fs.copyFileSync(FILE, path.join(BACKUP_DIR, `darkcup-${stamp}.json`))
  const old = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('darkcup-') && f.endsWith('.json'))
    .sort()
  while (old.length > MAX_BACKUPS) {
    fs.unlinkSync(path.join(BACKUP_DIR, old.shift()))
  }
}

export function init () {
  ensureDirs()
  backupOnStart()
  if (fs.existsSync(FILE)) {
    const raw = fs.readFileSync(FILE, 'utf8')
    try {
      doc = JSON.parse(raw)
    } catch (err) {
      // Fail closed: never overwrite a file we cannot parse. Refuse to start.
      throw new Error(`Data file is corrupt and will not be touched: ${FILE}. ` +
        `Fix or restore it from ${BACKUP_DIR} before starting. (${err.message})`)
    }
    for (const key of ['people', 'journal', 'cases', 'poison', 'quicknotes']) {
      if (!Array.isArray(doc[key])) doc[key] = []
    }
  } else {
    doc = EMPTY()
    save()
  }
}

function save () {
  doc.updatedAt = new Date().toISOString()
  fs.writeFileSync(TMP, JSON.stringify(doc, null, 2), 'utf8')
  fs.renameSync(TMP, FILE)
}

export function getDoc () {
  return doc
}

export function mutate (fn) {
  const result = fn(doc)
  save()
  return result
}

export function replaceAll (next) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  if (fs.existsSync(FILE)) {
    fs.copyFileSync(FILE, path.join(BACKUP_DIR, `pre-import-${stamp}.json`))
  }
  doc = next
  save()
  return doc
}
