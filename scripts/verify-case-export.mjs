// Checks the case-file parchment modal end to end: open, render, produce the PNG blob.
// Usage: node scripts/verify-case-export.mjs <caseId> <outDir>
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.DARKCUP_URL || 'http://localhost:4201'
const [caseId, outDir] = process.argv.slice(2)

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1200 })
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message))

  await page.goto(`${BASE}/#/cases/${caseId}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('.case-timeline')

  const [openBtn] = await page.$$("xpath/.//button[contains(., 'Export parchment')]")
  if (!openBtn) throw new Error('export button not found')
  await openBtn.click()
  await page.waitForSelector('.modal .desk .pp')
  await new Promise(r => setTimeout(r, 800))
  await page.screenshot({ path: path.join(outDir, 'case-modal.png') })

  await page.evaluate(() => {
    window.__capturedBlob = null
    const orig = URL.createObjectURL.bind(URL)
    URL.createObjectURL = (blob) => { window.__capturedBlob = blob; return orig(blob) }
  })
  const [dlBtn] = await page.$$("xpath/.//button[contains(., 'Download PNG')]")
  if (!dlBtn) throw new Error('download button not found')
  await dlBtn.click()
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
  const file = path.join(outDir, 'case-parchment.png')
  fs.writeFileSync(file, Buffer.from(b64, 'base64'))
  const buf = fs.readFileSync(file)
  const width = buf.readUInt32BE(16)
  console.log(`case parchment: ${width}px wide, ${Math.round(buf.length / 1024)} KB`)
  if (width !== 1800) throw new Error(`expected width 1800, got ${width}`)
  console.log('CASE EXPORT PASSED')
} finally {
  await browser.close()
}
