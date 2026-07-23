import { forwardRef } from 'react'
import { formatWorldDate, SIGNATURE } from '../lore.js'

const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23g)' opacity='0.55'/%3E%3C/svg%3E\")"
const MOTTLE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4' seed='7' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23m)' opacity='0.7'/%3E%3C/svg%3E\")"

const PAPER = {
  court: { fill: '#e7d5a8', edge: 9, seed: 4 },
  field: { fill: '#dcc691', edge: 16, seed: 11 },
  seal: { fill: '#dfc99a', edge: 11, seed: 23 }
}

function Paper ({ styleKey }) {
  const p = PAPER[styleKey] || PAPER.court
  const fid = `rough-${styleKey}`
  return (
    <svg className="pp-paper" aria-hidden="true">
      <defs>
        <filter id={fid} x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" seed={p.seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={p.edge} />
        </filter>
      </defs>
      <rect
        x="1.2%" y="0.9%" width="97.6%" height="98.2%"
        fill={p.fill} filter={`url(#${fid})`}
      />
    </svg>
  )
}

export function WaxSeal ({ size = 96 }) {
  return (
    <svg className="pp-seal" width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <filter id="wax-rough" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
        </filter>
        <radialGradient id="wax-body" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#8c2a20" />
          <stop offset="55%" stopColor="#6d1c16" />
          <stop offset="100%" stopColor="#471009" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="38" fill="url(#wax-body)" filter="url(#wax-rough)" />
      <circle cx="48" cy="48" r="27" fill="none" stroke="#3a0d08" strokeWidth="2.2" filter="url(#wax-rough)" />
      <circle cx="47.2" cy="47.2" r="27" fill="none" stroke="rgba(235,160,130,0.28)" strokeWidth="1" filter="url(#wax-rough)" />
      <path
        d="M38 33h20l-1.9 9.5a8.2 8.2 0 0 1-6.3 6.4V56h5.7v3.8H40.5V56h5.7v-7.1a8.2 8.2 0 0 1-6.3-6.4z"
        fill="#3a0d08" filter="url(#wax-rough)"
      />
      <path
        d="M37.3 32.3h20l-1.9 9.5a8.2 8.2 0 0 1-6.3 6.4"
        fill="none" stroke="rgba(235,160,130,0.22)" strokeWidth="1" filter="url(#wax-rough)"
      />
      <ellipse cx="36" cy="30" rx="12" ry="6" fill="rgba(255,220,190,0.10)" transform="rotate(-28 36 30)" />
    </svg>
  )
}

function CornerOrnament ({ corner }) {
  return (
    <svg className={`pp-corner pp-corner-${corner}`} width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
      <g fill="none" stroke="rgba(58,40,18,0.55)" strokeWidth="1.2">
        <path d="M4 42 C4 20 20 4 42 4" />
        <path d="M10 42 C10 24 24 10 42 10" />
        <path d="M4 42 l8 -3 M42 4 l-3 8" />
      </g>
      <circle cx="9" cy="9" r="2.2" fill="rgba(58,40,18,0.5)" />
    </svg>
  )
}

export function renderRedacted (text) {
  const parts = []
  const re = /\[\[(.*?)\]\]/gs
  let last = 0
  let m
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>)
    parts.push(<span key={key++} className="pp-redact" title="redacted">{m[1] || '   '}</span>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>)
  return parts
}

function Body ({ text, dropcap }) {
  const paragraphs = (text || '').split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  return (
    <div className="pp-body">
      {paragraphs.map((para, i) => {
        // A real span, not ::first-letter: pseudo-elements are lost by html-to-image.
        const useInitial = dropcap && i === 0 && /^[A-Za-z]/.test(para)
        const rest = useInitial ? para.slice(1) : para
        return (
          <p key={i}>
            {useInitial && <span className="pp-initial">{para[0]}</span>}
            {rest.split('\n').map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderRedacted(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

const ParchmentPage = forwardRef(function ParchmentPage ({ entry, styleKey = 'court', exporting = false }, ref) {
  const worldDate = formatWorldDate(entry)
  return (
    <div ref={ref} className={`pp pp-${styleKey}` + (exporting ? ' exporting' : '')}>
      <Paper styleKey={styleKey} />
      <div className="pp-mottle" style={{ backgroundImage: MOTTLE }} />
      <div className="pp-grain" style={{ backgroundImage: GRAIN }} />
      <div className="pp-vignette" />
      <div className="pp-stain pp-stain-a" />
      <div className="pp-stain pp-stain-b" />
      <div className="pp-stain pp-stain-c" />

      {styleKey === 'court' && (
        <>
          <div className="pp-frame outer" />
          <div className="pp-frame inner" />
          <CornerOrnament corner="tl" />
          <CornerOrnament corner="tr" />
          <CornerOrnament corner="bl" />
          <CornerOrnament corner="br" />
        </>
      )}
      {styleKey === 'seal' && (
        <>
          <div className="pp-frame heavy" />
          <div className="pp-frame gilt" />
        </>
      )}

      <div className="pp-inner">
        <header className="pp-head">
          {styleKey === 'court' && <div className="pp-ornament">❦</div>}
          <h1 className="pp-title">{entry.title || 'Untitled'}</h1>
          {worldDate && <div className="pp-date">{worldDate}</div>}
          <div className="pp-rule" />
        </header>

        <Body text={entry.body} dropcap={styleKey !== 'field'} />

        <footer className="pp-foot">
          <div className="pp-rule" />
          <div className="pp-signoff">
            <div className="pp-sig">
              <span className="pp-sig-hand">By my hand,</span>
              <span className="pp-sig-initials">{SIGNATURE.initials}</span>
              <span className="pp-sig-epithet">{SIGNATURE.epithet}</span>
            </div>
            <WaxSeal size={styleKey === 'seal' ? 112 : 92} />
          </div>
        </footer>
      </div>
    </div>
  )
})

export default ParchmentPage
