// A whisper of state for the sync indicator: how many writes are in flight.
const listeners = new Set()
let inFlight = 0

export function trackWrite (promise) {
  inFlight++
  listeners.forEach(fn => fn(inFlight))
  const settle = () => {
    inFlight--
    listeners.forEach(fn => fn(inFlight))
  }
  promise.then(settle, settle)
  return promise
}

export function onBusy (fn) {
  listeners.add(fn)
  fn(inFlight)
  return () => listeners.delete(fn)
}
