import { useEffect, useState, useCallback } from 'react'
import { useData } from './state.jsx'
import Ledger from './components/Ledger.jsx'
import PersonPage from './components/PersonPage.jsx'
import Journal from './components/Journal.jsx'
import JournalEditor from './components/JournalEditor.jsx'
import ReadView from './components/ReadView.jsx'
import Cases from './components/Cases.jsx'
import CasePage from './components/CasePage.jsx'
import Poison from './components/Poison.jsx'
import QuickNotes from './components/QuickNotes.jsx'
import QuickJot from './components/QuickJot.jsx'
import Archive from './components/Archive.jsx'
import SearchPalette from './components/SearchPalette.jsx'
import Toasts from './components/Toasts.jsx'

function parseHash () {
  const h = window.location.hash.replace(/^#\/?/, '')
  const parts = h.split('/').filter(Boolean)
  if (parts.length === 0) return { page: 'ledger' }
  if (parts[0] === 'person' && parts[1]) return { page: 'person', id: parts[1] }
  if (parts[0] === 'journal') {
    if (!parts[1]) return { page: 'journal' }
    if (parts[1] === 'new') return { page: 'journal-new' }
    if (parts[2] === 'edit') return { page: 'journal-edit', id: parts[1] }
    return { page: 'read', id: parts[1] }
  }
  if (parts[0] === 'cases') {
    if (!parts[1]) return { page: 'cases' }
    return { page: 'case', id: parts[1] }
  }
  if (parts[0] === 'poison') return { page: 'poison' }
  if (parts[0] === 'quick') return { page: 'quick' }
  if (parts[0] === 'archive') return { page: 'archive' }
  return { page: 'ledger' }
}

export function go (path) {
  window.location.hash = path
}

const NAV = [
  { hash: '#/', label: 'The Ledger', match: ['ledger', 'person'], count: db => db.people.length },
  { hash: '#/journal', label: 'The Journal', match: ['journal', 'journal-new', 'journal-edit', 'read'], count: db => db.journal.length },
  { hash: '#/cases', label: 'The Cases', match: ['cases', 'case'], count: db => db.cases.filter(c => c.status === 'open').length },
  { hash: '#/poison', label: 'The Poison Log', match: ['poison'], count: db => db.poison.length },
  { hash: '#/quick', label: 'Quick Notes', match: ['quick'], count: db => db.quicknotes.length },
  { hash: '#/archive', label: 'The Archive', match: ['archive'], count: () => 0 }
]

export default function App () {
  const { db, error, reload } = useData()
  const [route, setRoute] = useState(parseHash)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [jotOpen, setJotOpen] = useState(false)

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const onKeyDown = useCallback((e) => {
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setJotOpen(false)
      setPaletteOpen(v => !v)
    } else if (e.key === '/' && !inField) {
      e.preventDefault()
      setPaletteOpen(true)
    } else if (e.key.toLowerCase() === 'q' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      setPaletteOpen(false)
      setJotOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  if (error) {
    return (
      <div className="app-message">
        <p className="flavor">The candle has guttered.</p>
        <p className="detail">{error}</p>
        <button className="btn" onClick={reload}>Relight it</button>
      </div>
    )
  }
  if (!db) {
    return <div className="app-message"><p className="flavor">Lighting the candle…</p></div>
  }

  const isRead = route.page === 'read'

  return (
    <div className={'app' + (isRead ? ' app-reading' : '')}>
      <nav className="spine">
        <a className="masthead" href="#/">
          <span className="masthead-title">The Dark Cup</span>
          <span className="masthead-sub">the private record of</span>
          <span className="masthead-name">Yiliang Peng Black-Throat</span>
          <span className="masthead-office">Housecarl of Windhelm</span>
        </a>
        <div className="nav-links">
          {NAV.map(item => {
            const n = item.count(db)
            return (
              <a
                key={item.hash}
                href={item.hash}
                className={'nav-link' + (item.match.includes(route.page) ? ' active' : '')}
              >
                <span>{item.label}</span>
                {n > 0 && <span className="nav-count">{n}</span>}
              </a>
            )
          })}
        </div>
        <div className="spine-foot">
          <button className="search-hint" onClick={() => setPaletteOpen(true)}>
            Search the records <kbd>Ctrl K</kbd>
          </button>
          <button className="search-hint" onClick={() => setJotOpen(true)}>
            Jot a quick note <kbd>Q</kbd>
          </button>
        </div>
      </nav>

      <main className="page">
        {route.page === 'ledger' && <Ledger />}
        {route.page === 'person' && <PersonPage personId={route.id} />}
        {route.page === 'journal' && <Journal />}
        {route.page === 'journal-new' && <JournalEditor />}
        {route.page === 'journal-edit' && <JournalEditor entryId={route.id} />}
        {route.page === 'read' && <ReadView entryId={route.id} />}
        {route.page === 'cases' && <Cases />}
        {route.page === 'case' && <CasePage caseId={route.id} />}
        {route.page === 'poison' && <Poison />}
        {route.page === 'quick' && <QuickNotes />}
        {route.page === 'archive' && <Archive />}
      </main>

      {paletteOpen && (
        <SearchPalette
          onClose={() => setPaletteOpen(false)}
          onJot={() => { setPaletteOpen(false); setJotOpen(true) }}
        />
      )}
      {jotOpen && <QuickJot onClose={() => setJotOpen(false)} />}
      <Toasts />
    </div>
  )
}
