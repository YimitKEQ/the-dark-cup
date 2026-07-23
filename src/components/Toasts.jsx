import { useEffect, useState } from 'react'
import { onToast } from '../toast.js'

export default function Toasts () {
  const [items, setItems] = useState([])

  useEffect(() => onToast(item => {
    setItems(list => [...list, item])
    setTimeout(() => setItems(list => list.filter(x => x.id !== item.id)), 2600)
  }), [])

  if (items.length === 0) return null
  return (
    <div className="toasts" aria-live="polite">
      {items.map(t => <div key={t.id} className="toast">{t.text}</div>)}
    </div>
  )
}
