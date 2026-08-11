// Rasterizes every page of a generated PDF to PNG so the layout can be inspected visually.
// Usage: node preview-pdf.mjs [file.pdf]
//   defaults to Yorvath-Palefang-Application.pdf; images land in .preview/<name>/
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = 'D:/TheDarkCUp';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET = process.argv[2] || 'Yorvath-Palefang-Application.pdf';
const PDF = join(ROOT, TARGET);
const OUTDIR = join(ROOT, '.preview', basename(TARGET, '.pdf'));
const TMP = join(ROOT, '.preview-tmp.html');
const SCALE = 1.35;

if (!existsSync(PDF)) {
  console.error(`No such PDF: ${PDF}`);
  process.exit(1);
}

if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true, force: true });
mkdirSync(OUTDIR, { recursive: true });

const pdfB64 = readFileSync(PDF).toString('base64');
const pdfjsSrc = readFileSync(join(ROOT, 'node_modules/pdfjs-dist/build/pdf.min.mjs'), 'utf8');
const workerSrc = readFileSync(join(ROOT, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'), 'utf8');

// Everything is inlined so the page needs no network or file fetches.
const HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{margin:0;background:#333;} canvas{display:block;margin:0;}</style>
</head><body>
<script type="module">
${pdfjsSrc}
window.__pdfjs = pdfjsLib;
</script>
<script type="module">
const workerBlob = new Blob([${JSON.stringify(workerSrc)}], { type: 'text/javascript' });
window.__ready = (async () => {
  while (!window.__pdfjs) await new Promise(r => setTimeout(r, 20));
  const pdfjsLib = window.__pdfjs;
  pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
  const raw = atob(${JSON.stringify(pdfB64)});
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const vp = page.getViewport({ scale: ${SCALE} });
    const canvas = document.createElement('canvas');
    canvas.id = 'p' + n;
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    document.body.appendChild(canvas);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  }
  return doc.numPages;
})();
</script>
</body></html>`;

writeFileSync(TMP, HTML, 'utf8');

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 1200 });
  await page.goto(`file:///${TMP.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  const count = await page.evaluate(async () => await window.__ready);
  console.log(`Rendering ${count} pages...`);

  for (let n = 1; n <= count; n++) {
    const el = await page.$(`#p${n}`);
    if (!el) throw new Error(`canvas #p${n} not found`);
    const file = join(OUTDIR, `page-${String(n).padStart(2, '0')}.png`);
    await el.screenshot({ path: file });
    console.log(`  ${file}`);
  }
  console.log(`\nDone. ${count} page images in ${OUTDIR}`);
} finally {
  await browser.close();
  try { rmSync(TMP, { force: true }); } catch (_) {}
}
