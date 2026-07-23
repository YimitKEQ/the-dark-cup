// Capture the quick-jot overlay and the idle search palette for design review.
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outDir = process.argv[2]

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://localhost:4201/#/', { waitUntil: 'networkidle0' })
  await page.waitForSelector('.person-list')

  await page.keyboard.press('q')
  await page.waitForSelector('.palette.jot textarea')
  await page.type('.palette.jot textarea', 'The new dock guard drinks alone and pays in fresh-minted coin. Worth a look.')
  await page.screenshot({ path: path.join(outDir, 'v2-jot.png') })
  await page.keyboard.press('Escape')

  await page.keyboard.down('Control')
  await page.keyboard.press('k')
  await page.keyboard.up('Control')
  await page.waitForSelector('.palette input')
  await new Promise(r => setTimeout(r, 300))
  await page.screenshot({ path: path.join(outDir, 'v2-palette-idle.png') })

  console.log('overlay shots done')
} finally {
  await browser.close()
}
