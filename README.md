# The Dark Cup

A private, offline-first roleplay companion for Yiliang Peng Black-Throat, housecarl of Windhelm.
The Ledger keeps the names, the Journal keeps his hand, and the parchment export turns any entry
into an aged manuscript PNG fit for Discord.

## Run it

```
npm install
npm start
```

Then open http://localhost:4201. That is the whole ritual: `npm start` builds the frontend and
serves it with the data API from one process.

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
  Search and tag filters on every page.
- **The Journal**: long-form entries dated in Elder Scrolls months, linkable to Ledger names.
- **Parchment export**: three page styles (Court Hand, Field Note, Black Seal), rendered at 2x
  and downloaded as PNG. Wrap text in `[[double brackets]]` to redact it with a black bar.
- **Search everywhere**: press `Ctrl K` (or `/`) and whisper a name, a debt, a secret.

## Verifying the export

`node scripts/verify-export.mjs <journalEntryId> <outputDir>` drives the real app in headless
Chrome, captures all three parchment styles, produces the export PNG, and checks its dimensions.
