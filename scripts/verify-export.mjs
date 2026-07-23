// End-to-end check of the parchment PNG export using the locally installed Chrome.
// Usage: node scripts/verify-export.mjs <entryId> <outDir>
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.DARKCUP_URL || 'http://localhost:4201'
const [entryId, outDir] = process.argv.slice(2)

if (!entryId || !outDir) {
  console.error('usage: node scripts/verify-export.mjs <entryId> <outDir>')
  process.exit(1)
}

function pngSize (file) {
  const buf = fs.readFileSync(file)
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1400 })
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message))
  page.on('console', msg => { if (msg.type() === 'error') console.error('CONSOLE:', msg.text()) })

  const client = await page.createCDPSession()
  await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: outDir, eventsEnabled: true })

  await page.goto(`${BASE}/#/journal/${entryId}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('.desk .pp', { timeout: 15000 })

  const styles = ['Court Hand', 'Field Note', 'Black Seal']
  for (const name of styles) {
    const [btn] = await page.$$(`xpath/.//button[contains(@class,'style-pick')][contains(., '${name}')]`)
    if (!btn) throw new Error(`style button not found: ${name}`)
    await btn.click()
    await new Promise(r => setTimeout(r, 700))
    const desk = await page.$('.desk')
    const shotName = `style-${name.toLowerCase().replace(/\s/g, '-')}.png`
    await desk.screenshot({ path: path.join(outDir, shotName) })
    console.log(`captured ${shotName}`)
  }

  // Headless Chrome cancels the save step of blob downloads, so intercept the
  // blob the app produces and write it ourselves. This still exercises the full
  // render pipeline: fonts, textures, redaction, 2x scaling.
  await page.evaluate(() => {
    window.__capturedBlob = null
    const orig = URL.createObjectURL.bind(URL)
    URL.createObjectURL = (blob) => { window.__capturedBlob = blob; return orig(blob) }
  })
  const [exportBtn] = await page.$$("xpath/.//button[contains(., 'Download PNG')]")
  if (!exportBtn) throw new Error('export button not found')
  await exportBtn.click()
  await page.waitForFunction('window.__capturedBlob !== null', { timeout: 30000 })

  const b64 = await page.evaluate(async () => {
    const buf = await window.__capturedBlob.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let s = ''
    for (let i = 0; i < bytes.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
    }
    return btoa(s)
  })
  const downloaded = 'exported-parchment.png'
  fs.writeFileSync(path.join(outDir, downloaded), Buffer.from(b64, 'base64'))

  const size = pngSize(path.join(outDir, downloaded))
  const bytes = fs.statSync(path.join(outDir, downloaded)).size
  console.log(`exported ${downloaded}: ${size.width}x${size.height}, ${Math.round(bytes / 1024)} KB`)
  if (size.width !== 1800) throw new Error(`expected width 1800, got ${size.width}`)
  if (bytes < 100000) throw new Error(`file suspiciously small (${bytes} bytes), likely blank`)

  await page.keyboard.down('Control')
  await page.keyboard.press('k')
  await page.keyboard.up('Control')
  await page.waitForSelector('.palette input', { timeout: 5000 })
  await page.type('.palette input', 'warehouse')
  await new Promise(r => setTimeout(r, 400))
  await page.screenshot({ path: path.join(outDir, 'palette.png') })
  const rows = await page.$$('.palette-row')
  console.log(`palette results for "warehouse": ${rows.length}`)
  if (rows.length === 0) throw new Error('palette search returned nothing')

  console.log('ALL CHECKS PASSED')
} finally {
  await browser.close()
}
