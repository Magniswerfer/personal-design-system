// Renders the raster brand assets into src/assets/: app icons, favicon.ico
// and one 1200x630 share image per page. Needs Playwright's Chromium
// (`npx playwright install chromium-headless-shell`). Run with `npm run assets`
// after changing the mark, the page map or the section inks; the output is
// committed so the regular build stays dependency-free.

import { mkdir, writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import tokens from "../src/tokens/tokens.json" with { type: "json" };
import { flatten } from "../src/tokens/flatten.mjs";
import { SITE, PAGES } from "../src/content/site.mjs";
import { markSVG } from "../src/brand/mark.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FONTS = join(ROOT, "src/assets/fonts");
const BRAND = join(ROOT, "src/assets/brand");
const OG = join(ROOT, "src/assets/og");
const flat = flatten(tokens);
const tok = (path) => flat.find((t) => t.path === path).value;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const fontFace = `
@font-face { font-family: "Familjen Grotesk"; src: url("${pathToFileURL(join(FONTS, "familjen-grotesk.woff2"))}") format("woff2"); font-weight: 400 700; }
@font-face { font-family: "JetBrains Mono"; src: url("${pathToFileURL(join(FONTS, "jetbrains-mono.woff2"))}") format("woff2"); font-weight: 400 600; }`;

function shareHTML(page) {
  const field = tok(`color.section.${page.ink}`);
  const on = tok(`color.section.${page.ink}.on`);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: ${field}; color: ${on}; font-family: "Familjen Grotesk"; display: grid; grid-template-rows: auto 1fr auto; padding: 56px 64px 52px; }
header { display: flex; align-items: center; gap: 20px; font-size: 30px; font-weight: 700; }
header svg { width: 64px; height: 64px; display: block; }
header span:last-child { margin-left: auto; font-family: "JetBrains Mono"; font-size: 22px; font-weight: 400; }
h1 { align-self: end; font-size: ${page.word.length > 7 ? 200 : 240}px; font-weight: 700; line-height: 0.82; letter-spacing: -0.04em; margin-left: -10px; }
p { margin-top: 36px; font-size: 32px; line-height: 1.25; max-width: 30ch; }
</style></head><body>
<header>${markSVG({ size: 64, inset: 8 })}<span>${esc(SITE.name)}</span><span>${esc(page.nav)}</span></header>
<h1>${esc(page.word)}</h1>
<p>${esc(page.summary)}</p>
</body></html>`;
}

const iconHTML = (svg, size) =>
  `<!doctype html><html><head><style>*{margin:0}html,body{width:${size}px;height:${size}px;overflow:hidden;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style></head><body>${svg}</body></html>`;

// An .ico that wraps PNG images, which every current browser accepts.
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

const tmp = await mkdtemp(join(tmpdir(), "ds-assets-"));
const browser = await chromium.launch();

async function render(html, width, height, transparent = false) {
  const page = await browser.newPage({ viewport: { width, height } });
  const file = join(tmp, `r${Math.random().toString(36).slice(2)}.html`);
  await writeFile(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const data = await page.screenshot({ type: "png", omitBackground: transparent });
  await page.close();
  return data;
}

try {
  await rm(OG, { recursive: true, force: true });
  await Promise.all([mkdir(BRAND, { recursive: true }), mkdir(OG, { recursive: true })]);

  const icons = {
    "apple-touch-icon.png": [markSVG({ size: 180, inset: 30 }), 180],
    "icon-192.png": [markSVG({ size: 192, inset: 24 }), 192],
    "icon-512.png": [markSVG({ size: 512, inset: 64 }), 512],
    // Maskable: everything inside the central 80% safe zone.
    "icon-maskable-512.png": [markSVG({ size: 512, inset: 112 }), 512],
  };
  for (const [name, [svg, size]] of Object.entries(icons)) {
    await writeFile(join(BRAND, name), await render(iconHTML(svg, size), size, size));
  }

  const small = [];
  for (const size of [16, 32, 48]) {
    small.push({ size, data: await render(iconHTML(markSVG({ size, inset: size / 8 }), size), size, size) });
  }
  await writeFile(join(BRAND, "favicon.ico"), ico(small));

  for (const page of PAGES) {
    await writeFile(join(OG, `${page.slug}.png`), await render(shareHTML(page), 1200, 630));
  }
  console.log(`Rendered ${Object.keys(icons).length} icons, favicon.ico and ${PAGES.length} share images.`);
} finally {
  await browser.close();
  await rm(tmp, { recursive: true, force: true });
}
