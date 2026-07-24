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
import Web from './components/Web.jsx'
import Chronicle from './components/Chronicle.jsx'
import Archive from './components/Archive.jsx'
import VaultSetup from './components/VaultSetup.jsx'
import SearchPalette from './components/SearchPalette.jsx'
import Toasts from './components/Toasts.jsx'
import HelpSheet from './components/HelpSheet.jsx'
import SyncMark from './components/SyncMark.jsx'
import { toast } from './toast.js'

export function overlayOpen () {
  return !!document.querySelector('.palette-backdrop, .modal-backdrop')
}

const CANDLE_LINES = [
  'Lighting the candle…',
  'Trimming the wick…',
  'Unlocking the book…',
  'Warming the wax…',
  'Sharpening the quill…'
]

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
  if (parts[0] === 'web') return { page: 'web' }
  if (parts[0] === 'chronicle') return { page: 'chronicle' }
  if (parts[0] === 'archive') return { page: 'archive' }
  if (parts[0] === 'showcase') return { page: 'showcase' }
  return { page: 'ledger' }
}

export function go (path) {
  window.location.hash = path
}

const NAV = [
  { hash: '#/', label: 'The Ledger', match: ['ledger', 'person'], count: db => db.people.length },
  { hash: '#/web', label: 'The Web', match: ['web'], count: () => 0 },
  { hash: '#/journal', label: 'The Journal', match: ['journal', 'journal-new', 'journal-edit', 'read'], count: db => db.journal.length },
  { hash: '#/chronicle', label: 'The Chronicle', match: ['chronicle'], count: () => 0 },
  { hash: '#/cases', label: 'The Cases', match: ['cases', 'case'], count: db => db.cases.filter(c => c.status === 'open').length },
  { hash: '#/poison', label: 'The Poison Log', match: ['poison'], count: db => db.poison.length },
  { hash: '#/quick', label: 'Quick Notes', match: ['quick'], count: db => db.quicknotes.length },
  { hash: '#/archive', label: 'The Archive', match: ['archive'], count: () => 0 }
]

export default function App () {
  const { db, error, mode, reload, enterDemo, exitDemo } = useData()
  const [route, setRoute] = useState(parseHash)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [jotOpen, setJotOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [candleLine] = useState(() => CANDLE_LINES[Math.floor(Math.random() * CANDLE_LINES.length)])

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (route.page === 'showcase') {
      if (mode && mode !== 'demo') enterDemo()
      if (mode) go('/')
    }
  }, [route.page, mode, enterDemo])

  useEffect(() => {
    const onRejection = (e) => {
      const msg = e.reason?.message || 'something went wrong in the dark'
      toast(`The quill slipped: ${msg}`)
    }
    window.addEventListener('unhandledrejection', onRejection)
    return () => window.removeEventListener('unhandledrejection', onRejection)
  }, [])

  const onKeyDown = useCallback((e) => {
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setJotOpen(false)
      setHelpOpen(false)
      setPaletteOpen(v => !v)
    } else if (e.key === '/' && !inField) {
      e.preventDefault()
      setHelpOpen(false)
      setPaletteOpen(true)
    } else if (e.key.toLowerCase() === 'q' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (overlayOpen()) return
      e.preventDefault()
      setJotOpen(true)
    } else if (e.key === '?' && !inField) {
      if (overlayOpen()) return
      e.preventDefault()
      setHelpOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  if (mode === 'vault-setup') {
    return (
      <div className="app app-setup">
        <nav className="spine">
          <a className="masthead" href="#/">
            <span className="masthead-title">The Dark Cup</span>
            <span className="masthead-sub">the private record of</span>
            <span className="masthead-name">Yiliang Peng Black-Throat</span>
            <span className="masthead-office">Housecarl of Windhelm</span>
          </a>
        </nav>
        <main className="page"><VaultSetup /></main>
      </div>
    )
  }
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
    return <div className="app-message"><p className="flavor">{candleLine}</p></div>
  }

  const isRead = route.page === 'read'

  return (
    <div className={'app' + (isRead ? ' app-reading' : '') + (mode === 'demo' ? ' app-demo' : '')}>
      {mode === 'demo' && (
        <div className="demo-banner">
          <span>A showcase copy of the book. Every record here is invented, and nothing you do is kept.</span>
          <button className="link-btn" onClick={exitDemo}>leave the showcase</button>
        </div>
      )}
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
          <button className="search-hint" onClick={() => setHelpOpen(true)}>
            The shorthand <kbd>?</kbd>
          </button>
          <SyncMark />
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
        {route.page === 'web' && <Web />}
        {route.page === 'chronicle' && <Chronicle />}
        {route.page === 'archive' && <Archive />}
      </main>

      {paletteOpen && (
        <SearchPalette
          onClose={() => setPaletteOpen(false)}
          onJot={() => { setPaletteOpen(false); setJotOpen(true) }}
        />
      )}
      {jotOpen && <QuickJot onClose={() => setJotOpen(false)} />}
      {helpOpen && <HelpSheet onClose={() => setHelpOpen(false)} />}
      <Toasts />
    </div>
  )
}
