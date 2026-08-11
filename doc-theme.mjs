// doc-theme.mjs: shared typography, page architecture and render pipeline for the
// Yorvath Palefang documents. Both generators import from here so the look stays
// in one place instead of being copy-forked and drifting apart.
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';

export const BASE   = 'D:\\TheDarkCUp';
export const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function b64(rel) {
  return readFileSync(resolve(BASE, rel.replace(/\//g, '\\'))).toString('base64');
}

let fontCache = null;
function fontFaces() {
  if (fontCache) return fontCache;
  const YIMMY    = b64('Yimmy.ttf');
  const IMFELL   = b64('node_modules/@fontsource/im-fell-english/files/im-fell-english-latin-400-normal.woff2');
  const IMFELLI  = b64('node_modules/@fontsource/im-fell-english/files/im-fell-english-latin-400-italic.woff2');
  const IMFELLSC = b64('node_modules/@fontsource/im-fell-english-sc/files/im-fell-english-sc-latin-400-normal.woff2');
  const CORM     = b64('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2');
  const CORMI    = b64('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2');
  fontCache = `
@font-face { font-family:'Yimmy';    src:url('data:font/truetype;base64,${YIMMY}') format('truetype'); font-weight:normal; font-style:normal; }
@font-face { font-family:'IMFell';   src:url('data:font/woff2;base64,${IMFELL}')   format('woff2');      font-weight:400;    font-style:normal; }
@font-face { font-family:'IMFell';   src:url('data:font/woff2;base64,${IMFELLI}')  format('woff2');      font-weight:400;    font-style:italic; }
@font-face { font-family:'IMFellSC'; src:url('data:font/woff2;base64,${IMFELLSC}') format('woff2');      font-weight:400;    font-style:normal; }
@font-face { font-family:'Corm';     src:url('data:font/woff2;base64,${CORM}')     format('woff2');      font-weight:600;    font-style:normal; }
@font-face { font-family:'Corm';     src:url('data:font/woff2;base64,${CORMI}')    format('woff2');      font-weight:600;    font-style:italic; }
`;
  return fontCache;
}

const LAYOUT = `
/* The sheet is zero-margin so backgrounds can bleed to the paper edge. Chrome
   paints nothing into @page margins (neither html background propagation nor a
   fixed element, which clips to the page area), so real @page margins would
   leave white borders around the parchment. Per-page margins come from the
   repeating table header/footer below instead. */
@page { size: A4; margin: 0; }

html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'IMFell', Georgia, serif;
  font-size: 11pt;
  line-height: 1.72;
  color: #1c1612;
  background: transparent;
}

/* PARCHMENT
   Fixed elements repeat on every sheet and fill the page area, which equals the
   full sheet at zero margin. The negative z-index keeps it beneath the in-flow
   backgrounds of the dark pages, so it never bleeds through them. */
.page-bg {
  position: fixed; inset: 0;
  width: 210mm; height: 297mm;
  background: #e9dfbf;
  z-index: -1000;
}

/* PAGE MARGINS
   thead and tfoot repeat on every page, so these empty spacer rows give each
   sheet a real top and bottom margin that the flowing text cannot run into.
   Selectors are scoped by group to avoid one td rule cancelling another. */
table.doc { width: 210mm; border-collapse: collapse; }
table.doc td { vertical-align: top; }
table.doc thead td { height: 25mm; padding: 0; }
table.doc tfoot td { height: 22mm; padding: 0; }
table.doc tbody td { padding: 0 30mm; }

/* COVER */
.cover {
  width: 210mm; height: 297mm;
  background: #0c0b09;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  break-after: page; page-break-after: always;
  padding: 26mm 30mm 24mm;
}
.cover-top, .cover-mid, .cover-bot, .cover-foot {
  display: flex; flex-direction: column; align-items: center;
  width: 100%;
}
/* The mark sits near the optical centre; the epigraph and footing are anchored
   to the base, so the page is framed top and bottom and the single remaining
   void reads as deliberate rather than as three stranded islands. */
.cover-mid  { margin-top: 56mm; }
.cover-bot  { margin-top: auto; }
.cover-foot { margin-top: 13mm; }
.cover-eyebrow {
  font-family: 'Corm', serif; font-weight: 600;
  font-size: 7pt; letter-spacing: 0.34em; text-transform: uppercase;
  color: #7a9aaa; text-align: center;
}
.cover-hair { width: 100%; height: 0.5pt; background: #37332d; margin-top: 6mm; }
.cover-name {
  font-family: 'Yimmy', sans-serif;
  font-size: 46pt; font-weight: normal;
  color: #e8e0cc; text-align: center;
  line-height: 1.0; margin: 9mm 0 5mm;
}
.cover-sub {
  font-family: 'Corm', serif; font-weight: 600;
  font-size: 7.5pt; letter-spacing: 0.26em; text-transform: uppercase;
  color: #6f8794; text-align: center;
}
.cover-rule { width: 24mm; height: 0.75pt; background: #7a1e1e; margin-bottom: 9mm; opacity: 0.8; }
.cover-epigraph {
  font-family: 'Corm', serif; font-weight: 600; font-style: italic;
  font-size: 11pt; color: #ddd5b8;
  text-align: center; line-height: 1.62; max-width: 122mm; opacity: 0.88;
}
.cover-foot .cover-hair { margin-top: 0; margin-bottom: 5mm; }
.cover-foot-line {
  font-family: 'Corm', serif; font-weight: 600;
  font-size: 7pt; letter-spacing: 0.3em; text-transform: uppercase;
  color: #55636b; text-align: center;
}

/* OPENING NOTE */
.opening-note {
  font-style: italic; font-size: 10.5pt; color: #5e5040;
  border-left: 1.5pt solid #7a1e1e;
  padding: 1.5mm 0 1.5mm 5mm;
  margin-bottom: 9mm; line-height: 1.7;
  break-inside: avoid; page-break-inside: avoid;
}

/* SECTION HEADS */
.sh {
  font-family: 'IMFellSC', serif;
  font-size: 9pt; letter-spacing: 0.22em; text-transform: uppercase;
  color: #1c1612;
  margin-top: 11mm; margin-bottom: 5mm;
  padding-bottom: 1.8mm;
  border-bottom: 0.75pt solid #7a1e1e;
  break-after: avoid; page-break-after: avoid;
}
.sh:first-child { margin-top: 0; }

/* PROSE */
p { margin-bottom: 0.65em; text-align: justify; orphans: 3; widows: 3; }
p:last-child { margin-bottom: 0; }

/* CHARACTER BASICS */
.field { padding: 3mm 0; border-bottom: 0.5pt solid #d2c39c; break-inside: avoid; page-break-inside: avoid; }
.field:first-of-type { border-top: 0.5pt solid #d2c39c; }
.field-name {
  font-family: 'Corm', serif; font-weight: 600;
  font-size: 7.5pt; letter-spacing: 0.18em; text-transform: uppercase;
  color: #6d7f89; display: block; margin-bottom: 1.2mm;
}
.field-val { line-height: 1.66; }

/* Q&A */
.qa { margin-bottom: 5.5mm; }
.qa-label {
  font-family: 'Corm', serif; font-weight: 600; font-style: italic;
  font-size: 9.5pt; color: #7a1e1e;
  display: block; margin-bottom: 1.6mm;
  break-after: avoid; page-break-after: avoid;
}
.qa-answer { text-align: justify; }

/* LISTS */
ul, ol { padding-left: 5.5mm; margin: 1.5mm 0 0.65em; }
li { margin-bottom: 0.42em; line-height: 1.62; break-inside: avoid; page-break-inside: avoid; }
ul li::marker { color: #7a1e1e; font-size: 0.85em; }
strong { font-weight: bold; }

/* LABEL LIST */
.ll { list-style: none; padding: 0; margin-top: 2mm; }
.ll li { padding: 2.2mm 0; border-bottom: 0.5pt solid #ddd0aa; }
.ll li:last-child { border-bottom: none; }
/* Small caps in dark ink, so list terms read a level below the oxblood italic
   question labels instead of competing with them. */
.ll-name {
  font-family: 'IMFellSC', serif;
  font-size: 9pt; letter-spacing: 0.1em; text-transform: uppercase;
  color: #2b2119; display: block; margin-bottom: 1mm;
}

/* SCENARIOS */
.scenario { margin-bottom: 7.5mm; }
.sc-num {
  font-family: 'IMFellSC', serif; font-size: 8pt;
  letter-spacing: 0.24em; color: #6d7f89; text-transform: uppercase;
  display: block; margin-bottom: 1.8mm;
  break-after: avoid; page-break-after: avoid;
}
.sc-prompt {
  font-family: 'Corm', serif; font-weight: 600; font-style: italic;
  font-size: 10pt; color: #5e5040;
  padding-left: 5mm; border-left: 1pt solid #c5b494;
  margin-bottom: 3mm; line-height: 1.52;
  break-inside: avoid; page-break-inside: avoid;
  break-after: avoid; page-break-after: avoid;
}

/* OOC */
.ooc { font-style: italic; font-size: 9.5pt; color: #7a6a52; margin-top: 2.5mm; }

/* CLOSING + COLOPHON kept as one unit so neither can strand on a blank page */
.endmatter { margin-top: 11mm; break-inside: avoid; page-break-inside: avoid; }
.closing {
  padding-top: 5mm;
  border-top: 0.5pt solid #d2c39c;
  font-style: italic; font-size: 10pt; color: #7a6a52;
}
.closing p { text-align: left; }
.doc-colophon {
  font-family: 'Corm', serif; font-weight: 600;
  font-size: 7pt; letter-spacing: 0.18em;
  color: #a89877; text-align: center;
  margin-top: 8mm;
}

/* DARK FINALE PAGE */
.monologue-page {
  width: 210mm; height: 297mm;
  background: #110f0d;
  break-before: page; page-break-before: always;
  padding: 34mm 34mm;
  display: flex; flex-direction: column; justify-content: center;
}
.mono-eyebrow {
  font-family: 'Corm', serif; font-weight: 600;
  font-size: 7pt; letter-spacing: 0.32em; text-transform: uppercase;
  color: #6f8794; text-align: center; margin-bottom: 8mm;
}
.mono-rule { width: 20mm; height: 0.75pt; background: #7a1e1e; margin: 0 auto 11mm; opacity: 0.75; }
/* Scoped to .mono-body so it cannot out-specify the centered eyebrow above. */
.mono-body p {
  font-style: italic;
  font-size: 11.5pt; color: #ddd4b5;
  line-height: 1.86; text-align: justify; margin-bottom: 5mm;
}
.mono-body p:last-child { margin-bottom: 0; }
.drop-cap::first-letter {
  font-family: 'Corm', serif; font-style: normal; font-weight: 600;
  font-size: 3.8em; line-height: 0.76;
  float: left; padding-right: 2mm; color: #9a2222; margin-top: 1.5mm;
}
.mono-sign {
  font-family: 'Corm', serif; font-weight: 600;
  font-size: 7.5pt; letter-spacing: 0.28em; text-transform: uppercase;
  color: #5d6a72; text-align: center; margin-top: 12mm;
}
/* Pull quote variant of the dark page: centred, larger, no justification. */
.mono-pull p {
  font-family: 'Corm', serif; font-weight: 600; font-style: italic;
  font-size: 15pt; color: #e2d9bb;
  line-height: 1.62; text-align: center; margin-bottom: 6mm;
  max-width: 132mm; margin-left: auto; margin-right: auto;
}
.mono-pull p:last-child { margin-bottom: 0; }
`;

/**
 * Full stylesheet: embedded fonts plus the shared layout.
 * @param {string} extra Optional document specific CSS appended last.
 */
export function buildCss(extra = '') {
  return `${fontFaces()}\n${LAYOUT}\n${extra}`;
}

/**
 * The house sigil: a six armed frost crystal ringed with court text, a blood
 * drop at its heart. The ring legend differs per document.
 * @param {{ ring: string, size?: number }} opts
 */
export function sigil({ ring, size = 152 }) {
  const arms = [60, 120, 180, 240, 300]
    .map((deg) => `  <use href="#fa" transform="rotate(${deg},100,100)"/>`)
    .join('\n');
  // Twelve tick marks around the dial, at 30 degree steps.
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const x1 = 100 + 86 * Math.sin(a), y1 = 100 - 86 * Math.cos(a);
    const x2 = 100 + 93 * Math.sin(a), y2 = 100 - 93 * Math.cos(a);
    return `  <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#9aa1a8" stroke-width="1.5" stroke-linecap="round"/>`;
  }).join('\n');

  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <g id="fa" stroke="#9aa1a8" fill="none" stroke-linecap="round">
      <line x1="100" y1="100" x2="100" y2="38"  stroke-width="1.4"/>
      <line x1="89"  y1="68"  x2="111" y2="68"  stroke-width="1.4"/>
      <line x1="93"  y1="54"  x2="107" y2="54"  stroke-width="1"/>
      <line x1="97"  y1="42"  x2="100" y2="37"  stroke-width="0.9"/>
      <line x1="103" y1="42"  x2="100" y2="37"  stroke-width="0.9"/>
    </g>
    <path id="rpath" d="M 100,18 A 82,82 0 1,1 99.5,18" fill="none"/>
  </defs>
  <circle cx="100" cy="100" r="93" fill="none" stroke="#9aa1a8" stroke-width="1.5" opacity="0.85"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="#9aa1a8" stroke-width="0.7" stroke-dasharray="2,6" opacity="0.65"/>
${ticks}
  <use href="#fa"/>
${arms}
  <text font-family="serif" font-size="6.5" letter-spacing="3.5" fill="#6f8794">
    <textPath href="#rpath" startOffset="12%">${ring}</textPath>
  </text>
  <path d="M 100,117 C 82,107 82,85 100,80 C 118,85 118,107 100,117 Z" fill="#7a1e1e" opacity="0.95"/>
  <ellipse cx="96" cy="94" rx="3" ry="5.5" fill="rgba(255,255,255,0.14)"/>
  <line x1="95" y1="118" x2="94" y2="123" stroke="#7a1e1e" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  <line x1="105" y1="118" x2="106" y2="123" stroke="#7a1e1e" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
</svg>`;
}

/** Renders a complete HTML document to an A4 PDF via headless Chrome. */
export async function renderPdf({ html, out, tmpName }) {
  const tmp = resolve(BASE, tmpName);
  writeFileSync(tmp, html, 'utf8');
  console.log('HTML written. Launching Chrome...');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await page.pdf({
      path: out,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    console.log(`\nDone. PDF saved to:\n  ${out}`);
  } finally {
    await browser.close();
    try { unlinkSync(tmp); } catch (_) { /* temp file already gone */ }
  }
}
