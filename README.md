# The Dark Cup

A private, offline-first roleplay companion for Yiliang Peng Black-Throat, housecarl of Windhelm.
The Ledger keeps the names, the Journal keeps his hand, the Cases keep the pressure, and the
parchment export turns any of it into an aged manuscript PNG fit for Discord.

## Run it

```
npm install
npm start
```

Then open http://localhost:4201. That is the whole ritual: `npm start` builds the frontend and
serves it with the data API from one process. Other devices on the same network can use it at
`http://<your-ip>:4201` (a firewall rule scoped to the local subnet is required on Windows).

For development with hot reload: `npm run dev` (Vite on 5173, API proxied to 4201).

## Where the data lives

- Everything is written to `data/darkcup.json` by a small Express server. Writes are atomic
  (temp file, then rename), so a crash cannot leave a half-written book.
- On every server start, a dated backup is copied to `data/backups/`; the last twenty are kept.
- The Archive page exports the entire book as one JSON file and can restore from one. A restore
  backs up the current book first.
- If the data file is ever corrupt, the server refuses to start rather than overwrite it.

## Features

- **The Ledger**: people, with timestamped notes tagged debt / secret / threat / favour / ally.
  Search, tag filters with counts, sorting, and colored tag markers per person. Any person with
  notes can be exported as a parchment dossier.
- **The Journal**: long-form entries dated in Elder Scrolls months, linkable to Ledger names.
  The editor shows a live in-world date preview and word count, recovers unsaved drafts, and has
  a redact-selection button.
- **The Cases**: an escalation tracker per target. Steps (first contact, first warning, pressure
  applied, offered a way out, they escalated, resolved) on a roman-numeraled timeline with
  witnesses and in-world dates. Cases export to parchment.
- **The Poison Log**: dose, effect, and note per entry, with an ink-styled chart of the dose
  progression.
- **Quick Notes**: press `Q` anywhere to jot something mid-session. A quick note can later be
  sent to a person's Ledger page.
- **Parchment export**: three page styles (Court Hand, Field Note, Black Seal), rendered at 2x.
  Download as PNG or copy straight to the clipboard for Discord. Wrap text in
  `[[double brackets]]` to redact it with a black bar.
- **Search everywhere**: press `Ctrl K` (or `/`). With no query it offers quick actions and the
  recently touched records.

## Keyboard

- `Ctrl K` or `/`: search everything
- `Q`: jot a quick note from anywhere
- `N`: new name (Ledger) or focus the note composer (person page)
- `Ctrl S`: save the journal entry being written
- `Ctrl Enter`: save a note or case step from its composer

## Verifying the exports

- `node scripts/verify-export.mjs <journalEntryId> <outputDir>` drives the real app in headless
  Chrome, captures all three parchment styles, produces the export PNG, and checks its size.
- `node scripts/verify-case-export.mjs <caseId> <outputDir>` does the same for a case file.
