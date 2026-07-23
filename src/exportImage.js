import { toBlob } from 'html-to-image'

export async function parchmentBlob (node) {
  await document.fonts.ready
  return toBlob(node, {
    pixelRatio: 2,
    backgroundColor: 'rgba(0,0,0,0)',
    width: 900,
    height: node.offsetHeight
  })
}

export function slugify (s) {
  return (s || 'entry').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'entry'
}

export function downloadBlob (blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 30000)
}

export function canCopyImage () {
  return typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write
}

export async function copyBlob (blob) {
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}
