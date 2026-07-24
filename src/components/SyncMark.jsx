import { useEffect, useState } from 'react'
import { onBusy } from '../busy.js'
import { useData } from '../state.jsx'

export default function SyncMark () {
  const { mode } = useData()
  const [busy, setBusy] = useState(0)

  useEffect(() => onBusy(setBusy), [])

  if (mode !== 'vault') return null
  return (
    <div className={'sync-mark' + (busy > 0 ? ' writing' : '')}>
      {busy > 0 ? 'The ink dries…' : 'Bound to the vault'}
    </div>
  )
}
