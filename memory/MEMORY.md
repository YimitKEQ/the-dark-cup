# The Dark Cup: project memory

One-user roleplay companion for Lodie's Skyrim RP character, Yiliang Peng Black-Throat
("the Dark Cup"), housecarl to the Jarl of Windhelm. Personal, offline, no accounts.

## State (2026-07-24)

Everything shipped and verified: Ledger (with ties), Journal, parchment export, Cases, Poison
Log, Quick Notes, The Web (relationship graph), The Chronicle (unified timeline), Archive,
global Ctrl+K search, Q quick-jot, toasts, PWA manifest.

Deployed. Code repo: https://github.com/YimitKEQ/the-dark-cup (public: free-plan Pages
requires it). Live app: https://yimitkeq.github.io/the-dark-cup/ via
.github/workflows/deploy.yml on push to main. Data repo: YimitKEQ/darkcup-vault (private),
holding darkcup.json; the Pages app binds to it with a fine-grained PAT (Contents R/W, that
repo only) stored in each browser's localStorage. Verified end to end with puppeteer against
the live site: bind, create person, write note, commits appear in the vault. Vault was reset
to an empty book afterward; Lodie still needs to make his own PAT and bind his devices, then
export from local and import into the vault app if he wants to migrate.

Lodie is actively using LOCAL mode (http://192.168.178.194:4201 on LAN, firewall rule
"The Dark Cup (local web app)" scoped to LocalSubnet). His real entries live in
data/darkcup.json: never wipe that file. Test data must be seeded via API and deleted by
tracked id afterward (seed2.py pattern in the session scratchpad). The local server now runs
as a detached process (Start-Process), surviving session end.

## Architecture decisions

- Dual store: src/state.jsx picks 'server' (Express, local) or 'vault' (GitHub Contents API)
  at runtime via isStaticHost() (hostname ends in github.io). Both expose the same five-method
  store (data/create/update/remove/importAll). Vault mutations are serialized on a promise
  chain, sha-guarded, and retry once on 409; client assigns ids/timestamps exactly like the
  server (normalize map in src/vault.js). Research note (2026-07): free Node hosts with
  persistent disks are effectively gone (Fly free tier dead, Railway needs a card, Render free
  loses disk), which is why GitHub-as-database won.
- The Web is a dependency-free Fruchterman-Reingold layout (src/components/Web.jsx). The
  naive k^2/d^2 variant collapses small graphs into a clump; the standard k^2/d with ideal
  distance sqrt(area/n)*0.7 settles correctly.

- React 18 + Vite frontend, Express backend, all data in `data/darkcup.json`.
  JSON file over SQLite on purpose: single user, trivial backup/restore, no native deps.
  Atomic writes (tmp + rename) plus dated backups in `data/backups/` on every server start
  (last 20 kept). Corrupt data file = server refuses to start, never overwrites.
- `data/` is gitignored. Server is authoritative for ids and timestamps; validators per
  collection in server/index.js (people, journal, cases, poison, quicknotes).
- Fonts self-hosted via @fontsource (offline-first): Cormorant Garamond (UI), IM Fell
  English / SC (period body), MedievalSharp (handwritten style), UnifrakturMaguntia
  (blackletter).
- Parchment export: html-to-image `toBlob`, pixelRatio 2, hidden fixed-900px capture node.
  Shared pipeline in src/exportImage.js; ParchmentModal reuses it for case files and person
  dossiers (body text composed from steps/notes, so [[redaction]] works there too).
  "Copy for Discord" uses ClipboardItem; feature-detected because plain-HTTP LAN origins have
  no clipboard API (button simply hides on the second desktop).
- Hash routing, no router lib. One context provider (src/state.jsx) with a small crud factory.

## Hard-won gotchas

- 2026-07-24: Lodie misbound the vault to the PUBLIC code repo (the-dark-cup) and test
  records landed in its history (junk only; erased by force push). The app now fails closed:
  assertPrivateVault() checks repository visibility at bind time AND at vault load. Never
  remove that guard. He still needs to rebind his devices to darkcup-vault; his token must
  have access to that repo specifically.
- Showcase mode (#/showcase) is an in-memory demo book (src/demo.js) usable by strangers on
  the public site; it must never write anywhere. Undo everywhere works by full-book snapshot
  plus importAll restore.

- html-to-image does NOT render `::first-letter` or most pseudo-elements. The drop cap is a
  real `<span class="pp-initial">`. Do not convert it back to CSS.
- Headless Chrome cancels the save step of blob downloads; verify scripts intercept
  `URL.createObjectURL` instead. In headed Chrome downloads work (anchor must be appended to
  the DOM before click).
- Parchment texture layers multiply-blend greyscale noise: they need `sepia()` tint and a
  feathered mask or the page goes muddy with a hard boundary. Aging darkens edges
  (`.pp-vignette`), never the center.
- Raw `chrome --headless --screenshot` with `--window-size=390` renders WRONG mobile layout
  (spurious overflow). Use puppeteer `setViewport` for trustworthy mobile screenshots. Desktop
  raw screenshots are fine but need a fresh `--user-data-dir` per run, and the PNG lands on
  disk a second or two after the process exits.
- Lodie may be live in the app while you work: rebuilding dist is safe (static serves new
  files), but avoid server restarts when possible and never touch data/.

## Conventions

- In-character microcopy everywhere ("Enter a new name", "Burn it", "Jot it").
  Destructive actions use the two-step ConfirmButton, never window.confirm.
- Redaction syntax is `[[text]]`, rendered as a black bar sized to the hidden text; hover
  reveals it in-app but never in the export.
- Signature constants (initials "Y. B.", epithet) live in `src/lore.js` only, as do Elder
  Scrolls months, tags, case step types, and statuses.
- Port is 4201 (a nod to 4E 201).
- Verification before "done": npm run build, scripts/verify-export.mjs,
  scripts/verify-case-export.mjs, headless screenshots of changed views.
