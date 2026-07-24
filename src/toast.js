const listeners = new Set()
let counter = 0

export function toast (text, action = null) {
  const item = { id: ++counter, text, action }
  listeners.forEach(fn => fn(item))
}

export function onToast (fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
