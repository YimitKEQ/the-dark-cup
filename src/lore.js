export const MONTHS = [
  'Morning Star', "Sun's Dawn", 'First Seed', "Rain's Hand",
  'Second Seed', 'Midyear', "Sun's Height", 'Last Seed',
  'Hearthfire', 'Frostfall', "Sun's Dusk", 'Evening Star'
]

export const DEFAULT_YEAR = '4E 201'

export const TAGS = [
  { key: 'debt', label: 'Debt' },
  { key: 'secret', label: 'Secret' },
  { key: 'threat', label: 'Threat' },
  { key: 'favour', label: 'Favour' },
  { key: 'ally', label: 'Ally' }
]

export const STYLES = [
  { key: 'court', name: 'Court Hand', blurb: 'A fair copy, fit for official eyes' },
  { key: 'field', name: 'Field Note', blurb: 'Rough, carried in a coat pocket' },
  { key: 'seal', name: 'Black Seal', blurb: 'Weighted with the authority of the House' }
]

export const SIGNATURE = {
  initials: 'Y. B.',
  name: 'Yiliang Peng Black-Throat',
  epithet: 'The Dark Cup'
}

export const CASE_STEPS = [
  { key: 'contact', label: 'First contact' },
  { key: 'warning', label: 'First warning' },
  { key: 'pressure', label: 'Pressure applied' },
  { key: 'mercy', label: 'Offered a way out' },
  { key: 'escalation', label: 'They escalated' },
  { key: 'resolution', label: 'Resolved' },
  { key: 'other', label: 'Other' }
]

export const CASE_STATUS = [
  { key: 'open', label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'abandoned', label: 'Abandoned' }
]

export function caseStepLabel (key) {
  return (CASE_STEPS.find(s => s.key === key) || CASE_STEPS[0]).label
}

export const TIE_KINDS = [
  { key: 'kin', label: 'Kin' },
  { key: 'ally', label: 'Ally' },
  { key: 'rival', label: 'Rival' },
  { key: 'enemy', label: 'Enemy' },
  { key: 'debt', label: 'Debt' },
  { key: 'informant', label: 'Informant' },
  { key: 'patron', label: 'Patron' }
]

export function tieLabel (key) {
  return (TIE_KINDS.find(t => t.key === key) || TIE_KINDS[1]).label
}

const ROMAN = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
export function roman (n) {
  let out = ''
  for (const [v, s] of ROMAN) {
    while (n >= v) { out += s; n -= v }
  }
  return out || 'I'
}

export function countWords (text) {
  const m = (text || '').trim().match(/\S+/g)
  return m ? m.length : 0
}

function ordinal (n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatWorldDate (entry) {
  const parts = []
  if (entry.day) parts.push(ordinal(entry.day) + ' of')
  if (entry.month) parts.push(entry.month)
  let out = parts.join(' ')
  if (entry.year) out = out ? `${out}, ${entry.year}` : entry.year
  return out
}

export function formatRealDate (iso, withTime = true) {
  if (!iso) return ''
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  if (!withTime) return date
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

export function timeAgo (iso) {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'moments ago'
  const m = Math.floor(s / 60)
  if (m < 60) return m === 1 ? 'a minute ago' : `${m} minutes ago`
  const h = Math.floor(m / 60)
  if (h < 24) return h === 1 ? 'an hour ago' : `${h} hours ago`
  const d = Math.floor(h / 24)
  if (d < 7) return d === 1 ? 'yesterday' : `${d} days ago`
  const w = Math.floor(d / 7)
  if (w < 9) return w === 1 ? 'a week ago' : `${w} weeks ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return mo === 1 ? 'a month ago' : `${mo} months ago`
  const y = Math.floor(d / 365)
  return y === 1 ? 'a year ago' : `${y} years ago`
}

export function snippet (text, query, radius = 60) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, radius * 2)
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + query.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}
