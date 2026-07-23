# The Dark Cup: project memory

One-user roleplay companion for Lodie's Skyrim RP character, Yiliang Peng Black-Throat
("the Dark Cup"), housecarl to the Jarl of Windhelm. Personal, offline, no accounts.

## State (2026-07-24)

All seven planned features shipped and verified: Ledger, Journal, parchment export, Cases,
Poison Log, Quick Notes, Archive (JSON export/import), plus global Ctrl+K search with quick
actions and recents, Q quick-jot overlay, toasts, and a readability pass (18px base, brighter
ink palette).

Lodie is actively using it, including from a second desktop over LAN
(http://192.168.178.194:4201, firewall rule "The Dark Cup (local web app)" scoped to
LocalSubnet on all profiles because his home Wi-Fi is categorized Public). His real entries
live in data/darkcup.json: never wipe that file. Test data must be seeded via API and deleted
by tracked id afterward (see the seed2.py pattern in the session scratchpad).

## Architecture decisions

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
