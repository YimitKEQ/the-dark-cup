const SHORTCUTS = [
  ['Ctrl K or /', 'Search everything'],
  ['Q', 'Jot a quick note from anywhere'],
  ['N', 'New name in the Ledger, or focus the note composer on a person'],
  ['Ctrl S', 'Save the journal entry being written'],
  ['Ctrl Enter', 'Save a note or case step from its composer'],
  ['Shift Enter', 'New line in a quick note'],
  ['?', 'This sheet'],
  ['Esc', 'Close whatever is open']
]

const MARKS = [
  ['[[text]]', 'Redacts the text on parchment: a black bar, sized to the secret'],
  ['Hover a black bar', 'Reveals it in the app; never in the export']
]

export default function HelpSheet ({ onClose }) {
  return (
    <div className="palette-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="palette help-sheet" onKeyDown={e => { if (e.key === 'Escape') onClose() }}>
        <div className="jot-head">The Shorthand</div>
        <dl className="help-list">
          {SHORTCUTS.map(([keys, what]) => (
            <div key={keys} className="help-row">
              <dt><kbd>{keys}</kbd></dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
        <div className="jot-head">Marks of the trade</div>
        <dl className="help-list">
          {MARKS.map(([keys, what]) => (
            <div key={keys} className="help-row">
              <dt><code>{keys}</code></dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
