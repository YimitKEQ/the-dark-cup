import { useEffect, useState } from 'react'
import { onToast } from '../toast.js'

export default function Toasts () {
  const [items, setItems] = useState([])

  useEffect(() => onToast(item => {
    setItems(list => [...list, item])
    setTimeout(
      () => setItems(list => list.filter(x => x.id !== item.id)),
      item.action ? 8000 : 2600
    )
  }), [])

  if (items.length === 0) return null
  return (
    <div className="toasts" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className="toast">
          {t.text}
          {t.action && (
            <button
              className="toast-action"
              onClick={() => {
                t.action.fn()
                setItems(list => list.filter(x => x.id !== t.id))
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
