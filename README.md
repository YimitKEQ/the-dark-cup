# The Dark Cup

A private roleplay companion for Yiliang Peng Black-Throat, housecarl of Windhelm.
The Ledger keeps the names, the Journal keeps his hand, the Cases keep the pressure, and the
parchment export turns any of it into an aged manuscript PNG fit for Discord.

## Run it locally

```
npm install
npm start
```

Then open http://localhost:4201. That is the whole ritual: `npm start` builds the frontend and
serves it with the data API from one process. Other devices on the same network can use it at
`http://<your-ip>:4201` (a firewall rule scoped to the local subnet is required on Windows).

For development with hot reload: `npm run dev` (Vite on 5173, API proxied to 4201).

## Use it anywhere (the Vault)

The same app is deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to
`main`. Served from Pages, it has no local server, so it keeps the book in **the Vault**: a
private GitHub repository (`darkcup-vault`) that the app reads and writes through the GitHub
Contents API. Every save is a commit, so the vault holds every version of the book that has
ever existed.

Binding a device takes one fine-grained personal access token, scoped to only the vault
repository with Contents read and write. The token is stored in that browser's localStorage and
sent only to api.github.com. The published site is public (a GitHub Pages requirement on free
plans), but it holds no data; without a token it shows only the binding page.

Local mode and vault mode are the same book shape. Move between them with the Archive page's
export and restore.

## Where the data lives

- **Local mode**: `data/darkcup.json`, written atomically (temp file, then rename) by a small
  Express server. On every server start a dated backup is copied to `data/backups/`; the last
  twenty are kept. A corrupt data file makes the server refuse to start rather than overwrite.
- **Vault mode**: `darkcup.json` in the private vault repository. Writes are sha-guarded; on a
  conflict the store refetches and retries. History is the backup.
- The Archive page exports the entire book as one JSON file and restores from one, in both modes.

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
- **The Web**: a relationship map of everyone in the Ledger. Explicit ties (kin, ally, rival,
  enemy, debt, informant, patron) drawn in their color, shared journal pages as faint thread,
  and a red ring around anyone under an open case.
- **The Chronicle**: every note, entry, step, dose, and scrap in one river, newest first,
  filterable by kind.
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
