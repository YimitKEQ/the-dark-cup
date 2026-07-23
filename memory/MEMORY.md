# The Dark Cup: project memory

One-user roleplay companion for Lodie's Skyrim RP character, Yiliang Peng Black-Throat
("the Dark Cup"), housecarl to the Jarl of Windhelm. Personal, offline, no accounts.

## State (2026-07-24)

Phase 1 shipped: Ledger, Journal, parchment PNG export, global Ctrl+K search, JSON
export/import via the Archive page. Verified end to end (build, headless-Chrome screenshots
of every view, scripted export check producing an 1800px-wide PNG).

Not yet built, agreed for later phases: case files (escalation tracker per target), poison
log with chart, quick notes scratchpad. The server API already whitelists `cases`, `poison`,
and `quicknotes` collections, so phase 2 is frontend work plus real validators.

## Architecture decisions

- React 18 + Vite frontend, Express backend, all data in `data/darkcup.json`.
  JSON file over SQLite on purpose: single user, trivial backup/restore, no native deps.
  Atomic writes (tmp + rename) plus dated backups in `data/backups/` on every server start
  (last 20 kept). Corrupt data file = server refuses to start, never overwrites.
- `data/` is gitignored: backups are the JSON export plus `data/backups/`.
- Fonts self-hosted via @fontsource (offline-first): Cormorant Garamond (UI), IM Fell
  English / SC (period body), MedievalSharp (handwritten style), UnifrakturMaguntia
  (blackletter).
- Parchment export uses html-to-image `toBlob` (not html2canvas): native browser rendering
  means the SVG turbulence textures, masks, and blend modes export pixel-perfect.
  Capture happens on a hidden fixed-900px copy (`.capture-stage`), pixelRatio 2.
- Hash routing, no router lib. State: one context provider in `src/state.jsx`, server is
  authoritative for ids and timestamps.

## Hard-won gotchas

- html-to-image does NOT render `::first-letter` (or most pseudo-elements). The drop cap is
  a real `<span class="pp-initial">` for that reason. Do not convert it back to CSS.
- Headless Chrome cancels the save step of blob downloads, so `scripts/verify-export.mjs`
  intercepts `URL.createObjectURL` to grab the PNG bytes instead. In headed Chrome the
  download works normally (anchor is appended to the DOM before click, required).
- Texture layers on the parchment multiply-blend greyscale noise: they need `sepia()` tint
  and a feathered mask, or the page goes muddy with a visible hard boundary. Aging must
  darken edges, not the center (`.pp-vignette`).
- Headless Chrome screenshots need a fresh `--user-data-dir` per run or they silently fail
  on the profile lock.

## Conventions

- In-character microcopy everywhere ("Enter a new name", "Burn it", "Set it down").
  Destructive actions use the two-step ConfirmButton, never window.confirm.
- Redaction syntax is `[[text]]`, rendered as a black bar sized to the hidden text; hover
  reveals it in-app but never in the export.
- Signature constants (initials "Y. B.", epithet) live in `src/lore.js` only.
- Port is 4201 (a nod to 4E 201).
