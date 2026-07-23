// Integration test of the vault store against the real darkcup-vault repo.
// Run: GH_TOKEN=$(gh auth token) node scripts/test-vault.mjs
import { createVaultStore, fetchVault, putVault } from '../src/vault.js'

const cfg = {
  owner: 'YimitKEQ',
  repo: 'darkcup-vault',
  token: process.env.GH_TOKEN,
  path: 'darkcup.json'
}
if (!cfg.token) { console.error('no token'); process.exit(1) }

const store = createVaultStore(cfg)

const doc0 = await store.data()
console.log('open book:', Object.keys(doc0).filter(k => Array.isArray(doc0[k])).map(k => `${k}:${doc0[k].length}`).join(' '))

const person = await store.create('people', {
  name: 'The Binding Test',
  role: 'a ghost, soon struck',
  notes: [{ text: 'If this line survives, the vault holds.', tags: ['secret'] }]
})
console.log('created person:', person.id, '| note id assigned:', !!person.notes[0].id)

const updated = await store.update('people', person.id, { ...person, role: 'amended once' })
console.log('updated role:', updated.role)

// Conflict path: write with a stale sha directly, then mutate through the
// store, which must refetch and retry.
const cur = await fetchVault(cfg)
await putVault(cfg, cur.doc, cur.sha, 'external write to force staleness')
const afterConflict = await store.update('people', person.id, { ...updated, role: 'amended after conflict' })
console.log('survived stale-sha retry:', afterConflict.role)

await store.remove('people', person.id)
const final = await fetchVault(cfg)
console.log('struck the ghost, people left:', final.doc.people.length)

if (final.doc.people.length !== 0) throw new Error('cleanup failed')
console.log('VAULT STORE PASSED')
