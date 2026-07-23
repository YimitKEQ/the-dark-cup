import { useEffect, useRef, useState } from 'react'

export default function ConfirmButton ({ label, confirmLabel, onConfirm, className = 'btn' }) {
  const [armed, setArmed] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function click () {
    if (!armed) {
      setArmed(true)
      timer.current = setTimeout(() => setArmed(false), 3000)
    } else {
      clearTimeout(timer.current)
      setArmed(false)
      onConfirm()
    }
  }

  return (
    <button className={className + (armed ? ' armed' : '')} onClick={click}>
      {armed ? confirmLabel : label}
    </button>
  )
}
