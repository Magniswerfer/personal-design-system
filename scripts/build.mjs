// Builds dist/: ds.css, tokens, fonts and the docs pages, all from src/.
// No dependencies. Run with `node scripts/build.mjs` (wrangler runs it too).

import { mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import tokens from "../src/tokens/tokens.json" with { type: "json" };
import { flatten, toCSS } from "../src/tokens/flatten.mjs";
import { components } from "../src/content/components.mjs";
import { principles, surfaces } from "../src/content/principles.mjs";
import { SITE, PAGES } from "../src/content/site.mjs";
import { markSVG } from "../src/brand/mark.mjs";
import { fillTemplate } from "../src/templates/fill.mjs";
import { templateValues } from "../worker/mcp.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const read = (p) => readFile(join(SRC, p), "utf8");
const flat = flatten(tokens);
const tok = (path) => flat.find((t) => t.path === path);

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return ((x + 0.05) / (y + 0.05)).toFixed(1);
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const counts = {
  index: principles.length,
  colour: flat.filter((t) => t.path.startsWith("color.") && !t.path.endsWith(".on")).length,
  type: flat.filter((t) => t.path.startsWith("font.")).length,
  space: flat.filter((t) => /^(space|grid|radius|border|motion)\./.test(t.path)).length,
  components: components.length,
  surfaces: surfaces.length,
  mcp: 5,
};
const units = { index: "principles", colour: "", type: "", space: "", components: "components", surfaces: "surfaces", mcp: "tools" };

// ---- Shared fragments ----
// The one inline script: apply a stored theme before first paint. Its hash goes in the CSP.
const THEME_SCRIPT = `try{const t=localStorage.getItem("ds-theme");if(t)document.documentElement.dataset.theme=t}catch{}`;
const THEME_HASH = createHash("sha256").update(THEME_SCRIPT).digest("base64");

const abs = (path) => SITE.url + path;

function head(page, { noindex = false } = {}) {
  const title = page.slug === "index" ? `${SITE.name}: tokens, components and an MCP server` : `${page.nav} · ${SITE.name}`;
  const url = abs(page.href);
  const image = abs(`/og/${page.slug === "404" ? "index" : page.slug}.png`);
  const alt = `${page.word}: ${page.summary}`;
  const jsonld = page.slug === "index"
    ? `\n<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url + "/",
        description: SITE.description,
        inLanguage: "en",
        author: { "@type": "Person", name: SITE.author },
      })}</script>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.summary)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="author" content="${esc(SITE.author)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="${tok(`color.section.${page.ink}`).value}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="${SITE.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.summary)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(page.summary)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(alt)}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">
<link rel="preload" href="/fonts/familjen-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/source-serif-4.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/ds.css">
<link rel="stylesheet" href="/docs.css">
<script>${THEME_SCRIPT}</script>
<script type="module" src="/docs.js"></script>${jsonld}
</head>`;
}

function masthead(page) {
  const links = PAGES.map(
    (p) => `<a href="${p.href}"${p.slug === page.slug ? ' aria-current="page"' : ""}>${p.nav}</a>`
  ).join("\n        ");
  return `<a class="ds-visually-hidden" href="#main">Skip to content</a>
<header class="ds-masthead site-masthead" data-ink="${page.ink}">
  <div class="ds-masthead__inner">
    <a class="ds-masthead__mark" href="/">Magnus Design System</a>
    <nav class="ds-masthead__nav" aria-label="Sections">
        ${links}
    </nav>
    <button class="ds-button theme-toggle" data-variant="ghost" data-size="small" type="button">Dark</button>
  </div>
</header>`;
}

function band(page) {
  const n = Math.round(counts[page.slug]);
  const meta = units[page.slug] ? `${n} ${units[page.slug]}` : `${n} tokens`;
  return `<section class="ds-band" data-ink="${page.ink}" data-animate>
  <div class="ds-band__inner">
    <h1 class="ds-band__word">${page.word}</h1>
    <p class="ds-band__summary">${esc(page.summary)}</p>
    <p class="ds-band__meta">${meta} · v0.1</p>
  </div>
</section>`;
}

function pager(page) {
  const i = PAGES.findIndex((p) => p.slug === page.slug);
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  return `<nav class="pager" aria-label="Pages">
  ${prev ? `<a href="${prev.href}"><small>Previous</small><b>${prev.nav}</b></a>` : "<span></span>"}
  ${next ? `<a href="${next.href}"><small>Next</small><b>${next.nav}</b></a>` : "<span></span>"}
</nav>`;
}

function footer() {
  return `<footer class="foot">
  <div class="doc">
    <p class="foot__left">Magnus Design System, v0.1. Built from one tokens.json.</p>
    <p class="foot__right"><a class="ds-link" href="/api/tokens">tokens.json</a><a class="ds-link" href="/ds.css">ds.css</a><a class="ds-link" href="/mcp-server">MCP</a></p>
  </div>
</footer>`;
}

function toc(sections) {
  return `<nav class="toc" aria-label="On this page">
  <p class="ds-label toc__title">On this page</p>
  <ol>${sections.map(([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`).join("")}</ol>
</nav>`;
}

function sheet(id, title, body, tag = "") {
  return `<section class="sheet" id="${id}" aria-labelledby="${id}-h">
  <div class="sheet__head"><h2 id="${id}-h">${esc(title)}</h2>${tag}</div>
  ${body}
</section>`;
}

function code(source, filename = "html", origin = false) {
  return `<figure class="ds-code">
  <figcaption class="ds-code__head"><span>${esc(filename)}</span><button class="ds-button" data-variant="ghost" data-size="small" type="button" data-copy>Copy</button></figcaption>
  <pre${origin ? " data-origin" : ""}><code>${esc(source)}</code></pre>
</figure>`;
}

function layout(page, { aside, main, sections, wide = false }) {
  return `${head(page)}
<body data-ink="${page.ink}">
${masthead(page)}
<main id="main">
${band(page)}
<div class="doc"${wide ? " data-wide" : ""}>
  <aside class="doc__aside">${aside}</aside>
  <div class="doc__main">
    ${main}
    ${pager(page)}
  </div>
  ${sections.length ? `<div class="doc__toc">${toc(sections)}</div>` : ""}
</div>
</main>
${footer()}
</body>
</html>
`;
}

const swatch = (t, label, extra = "") =>
  `<button class="swatch" type="button" data-copy="var(${t.name})" style="--c: var(${t.name});${extra}" aria-label="Copy var(${t.name})">
  <span class="swatch__chip">${label ?? ""}</span>
  <span class="swatch__info"><span class="swatch__name">${esc(t.path.split(".").slice(t.path.startsWith("color.section") ? 2 : 1).join(" "))}</span><span class="swatch__val">${t.value}${t.dark ? ` / ${t.dark}` : ""}</span><span class="swatch__val">${t.name}</span></span>
</button>`;

// ---- Pages ----
const pages = {};

pages.index = (page) => {
  const sections = [["start", "Start"], ["principles", "Principles"], ["sections", "Sections"], ["source", "One source"]];
  const maxCount = Math.max(...PAGES.slice(1).map((p) => counts[p.slug]));
  const rail = PAGES.slice(1)
    .map((p) => `<a href="${p.href}" data-ink="${p.ink}" style="--extent:${(counts[p.slug] / maxCount).toFixed(3)}"><b>${p.nav}</b><span>${Math.round(counts[p.slug])}</span><i class="rail__bar"></i></a>`)
    .join("");
  const main = [
    sheet("start", "Start", `<p class="lead">Link one stylesheet and write plain HTML. Everything here works in a static page, an Astro site, a React app or a Worker.</p>
${code(`<link rel="stylesheet" href="https://ds.example.dev/ds.css">

<body data-ink="teal">
  <section class="ds-band" data-ink="teal">
    <div class="ds-band__inner">
      <h1 class="ds-band__word">Garden</h1>
    </div>
  </section>
</body>`, "index.html", true)}`),
    sheet("principles", "Principles", principles.map((p) => `<div><h3>${esc(p.title)}</h3><p class="ds-prose" style="margin-top:var(--ds-space-2)">${esc(p.body)}</p></div>`).join("\n")),
    sheet("sections", "Sections", `<p class="ds-prose">Each section prints in its own ink. Each bar's height is the number of entries it holds.</p><div class="rail">${rail}</div>`),
    sheet("source", "One source", `<div class="ds-prose">
<p><code>src/tokens/tokens.json</code> holds every value in the W3C design tokens format. The build turns it into <code>ds.css</code>, this site and the API; the Worker serves the same data over MCP. Change a value once and every consumer follows.</p>
</div>
<div class="ds-table-wrap"><table class="ds-table">
<thead><tr><th>Output</th><th>Path</th><th>For</th></tr></thead>
<tbody>
<tr><td>Stylesheet</td><td><a class="ds-link" href="/ds.css"><code>/ds.css</code></a></td><td>Every project</td></tr>
<tr><td>Tokens only</td><td><a class="ds-link" href="/tokens.css"><code>/tokens.css</code></a></td><td>Projects with their own components</td></tr>
<tr><td>Tokens, JSON</td><td><a class="ds-link" href="/api/tokens"><code>/api/tokens</code></a></td><td>Build tools, charts, native code</td></tr>
<tr><td>MCP</td><td><code>/mcp</code></td><td>AI agents</td></tr>
</tbody></table></div>`),
  ].join("\n");
  const aside = `<ol class="index-list">${PAGES.slice(1).map((p) => `<li><a href="${p.href}"><span>${p.nav}</span><small>${Math.round(counts[p.slug])}</small></a></li>`).join("")}</ol>`;
  return layout(page, { aside, main, sections });
};

pages.colour = (page) => {
  const sections = [["paper-ink", "Paper and ink"], ["inks", "Section inks"], ["signals", "Signals"], ["data", "Data"]];
  const group = (prefix) => flat.filter((t) => t.path.startsWith(prefix) && !t.path.endsWith(".on"));
  const inks = group("color.section.");
  const data = [
    ["Site", 34], ["Tools", 21], ["Notes", 17], ["Garden", 12], ["Reading", 9], ["Slides", 6], ["Admin", 4],
  ];
  const max = 40;
  const bars = data
    .map(([label, v], i) => {
      const y = 12 + i * 34;
      const w = (v / max) * 560;
      const ink = inks[i];
      const edge = ink.path.endsWith("chrome") ? ` stroke="var(--ds-ink)" stroke-width="1"` : "";
      return `<text x="0" y="${y + 17}">${label}</text><rect x="90" y="${y}" width="${w.toFixed(1)}" height="24" fill="var(${ink.name})"${edge}/><text x="${(96 + w).toFixed(1)}" y="${y + 17}" class="ds-num">${v} h</text>`;
    })
    .join("");
  const main = [
    sheet("paper-ink", "Paper and ink", `<p class="ds-prose">The ground is a near-white sheet, cool rather than cream. Text steps down in ink, never in hue. Click any swatch to copy its variable.</p>
<div class="swatches">${[...group("color.paper."), ...group("color.ink."), ...group("color.rule.")].map((t) => swatch(t)).join("")}</div>`),
    sheet("inks", "Section inks", `<p class="ds-prose">Seven inks after a reference manual's divider boards. Pick one per section or project and let it own a whole field: the band, a slide, a category. Text on an ink uses its paired <code>-on</code> colour.</p>
<div class="inks">${inks.map((t) => swatch(t, "Aa", ` --on: var(${t.name}-on);`)).join("")}</div>
${code(`<section class="ds-band" data-ink="oxide">…</section>
<span class="ds-tag" data-ink="grass">Garden</span>

/* or directly */
background: var(--ds-section-teal);
color: var(--ds-section-teal-on);`, "usage")}`),
    sheet("signals", "Signals", `<p class="ds-prose">Status colours appear only with a word or a mark. Vermilion is held out of the section inks so it only ever means error.</p>
<div class="swatches">${group("color.signal.").map((t) => swatch(t)).join("")}</div>`),
    sheet("data", "Data", `<p class="ds-prose">Charts use the section inks as the categorical palette, in order. Chrome gets a 1px ink edge on paper so it holds 3:1 against the ground.</p>
<figure class="ds-plate">
  <div class="ds-plate__stage wide"><svg class="chart" viewBox="0 0 720 256" role="img" aria-label="Bar chart: hours per project this month">${bars}</svg></div>
  <figcaption class="ds-plate__caption"><span>Hours per project, October</span><span>Example data</span></figcaption>
</figure>`),
  ].join("\n");
  const paper = tok("color.paper.base");
  const pairs = ["color.ink.base", "color.ink.muted", "color.ink.faint", "color.signal.error"].map(tok);
  const aside = `<figure class="ds-plate"><div class="contrast">${pairs
    .map((t) => `<div class="contrast__row"><span class="contrast__aa" style="color:var(${t.name})">Aa</span><span><b>${t.path.split(".").pop()}</b><span class="ds-num">${contrast(t.value, paper.value)}:1 light · ${contrast(t.dark, paper.dark)}:1 dark</span></span></div>`)
    .join("")}</div><figcaption class="ds-plate__caption"><span>Text on paper</span><span>WCAG ratio</span></figcaption></figure>`;
  return layout(page, { aside, main, sections });
};

pages.type = (page) => {
  const sections = [["faces", "Faces"], ["scale", "Scale"], ["pairing", "Pairing"], ["rules", "Rules"]];
  const sizes = flat.filter((t) => t.path.startsWith("font.size."));
  const sample = {
    monument: ["Ink", "grotesk", 700],
    display: ["Specimen", "grotesk", 700],
    h1: ["Building for one", "grotesk", 500],
    h2: ["Two voices that never swap", "grotesk", 500],
    h3: ["Section heading", "grotesk", 500],
    lead: ["A lead paragraph sets the scene in the serif.", "serif", 400],
    body: ["Running text sits at 17px with 1.6 leading and a 66 character measure.", "serif", 400],
    ui: ["Controls, navigation and table text", "grotesk", 400],
    small: ["Captions and help text", "grotesk", 400],
    label: ["LABEL · STATUS · CATEGORY", "grotesk", 500],
  };
  const ladder = sizes
    .map((t) => {
      const key = t.path.split(".").pop();
      const [txt, fam, w] = sample[key];
      const track = key === "monument" ? "var(--ds-tracking-monument)" : key === "label" ? "var(--ds-tracking-label)" : ["display", "h1", "h2"].includes(key) ? "var(--ds-tracking-heading)" : "0";
      const lh = ["monument", "display"].includes(key) ? "var(--ds-leading-tight)" : ["h1", "h2", "h3"].includes(key) ? "var(--ds-leading-heading)" : "1.4";
      return `<div class="ladder__row"><span>${key}</span><span class="ladder__sample" style="font-family:var(--ds-font-${fam});font-size:var(${t.name});font-weight:${w};letter-spacing:${track};line-height:${lh}">${txt}</span><span>${esc(t.value)}</span></div>`;
    })
    .join("");
  const set = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ÆØÅ abcdefghijklmnopqrstuvwxyz æøå 0123456789 &amp;@?!";
  const faces = [
    ["grotesk", "Familjen Grotesk", "Structure: display, headings, navigation, labels, controls, numbers. 400, 500, 700."],
    ["serif", "Source Serif 4", "Reading: running text, leads, quotes, empty states. 400 and italic."],
    ["mono", "JetBrains Mono", "Values: code, tokens, measurements, slide numbers. 400 to 600."],
  ];
  const main = [
    sheet("faces", "Faces", `<div class="faces">${faces
      .map(([k, name, role]) => `<div class="face"><p class="ds-label">${name}</p><p class="face__aa" style="font-family:var(--ds-font-${k})">Aa</p><p class="face__set" style="font-family:var(--ds-font-${k})">${set}</p><p class="ds-prose" style="margin-top:var(--ds-space-3);font-size:var(--ds-text-small)">${role}</p></div>`)
      .join("")}</div>`),
    sheet("scale", "Scale", `<p class="ds-prose">Display sizes are fluid. Monument is for the single band word and nothing else.</p><div class="ladder">${ladder}</div>`),
    sheet("pairing", "Pairing", `<figure class="ds-plate"><div class="ds-plate__stage left">
<h3 style="font-size:var(--ds-text-h1)">Notes on grids</h3>
<p class="lead">The grid is the one thing every surface shares, from a slide to a settings page.</p>
<div class="ds-prose"><p>Twelve columns with a 20px gutter. Reading text spans five to seven of them so the measure stays near 66 characters; images and tables may run wider. When a layout needs fewer columns on a phone, it drops columns, never the margin.</p></div>
</div><figcaption class="ds-plate__caption"><span>h1, lead, prose</span><span>grotesk over serif</span></figcaption></figure>`),
    sheet("rules", "Rules", `<div class="split"><div><p class="ds-label rules-title">Do</p><ul class="rules"><li>Headings, labels and numbers in the grotesk.</li><li>Running text in the serif, 66ch at most.</li><li>Tabular numerals in tables and stats.</li><li>More space above a heading than below it.</li></ul></div>
<div><p class="ds-label rules-title">Avoid</p><ul class="rules" data-kind="avoid"><li>Italic for emphasis in UI.</li><li>Mono for running text or headings.</li><li>A second monument-sized word on a page.</li><li>Tracking tighter than -0.04em.</li></ul></div></div>`),
  ].join("\n");
  const aside = `<div class="ds-plate"><div class="ds-plate__stage"><span style="font-size:7rem;font-weight:700;letter-spacing:-0.04em;line-height:.9">Ag</span></div><p class="ds-plate__caption"><span>Familjen Grotesk 700</span><span>OFL</span></p></div>`;
  return layout(page, { aside, main, sections });
};

pages.space = (page) => {
  const sections = [["scale", "Scale"], ["grid", "Grid"], ["shape", "Corners and rules"], ["motion", "Motion"]];
  const space = flat.filter((t) => t.path.startsWith("space."));
  const ruler = space.map((t) => `<div class="ruler__row"><span>${t.name.replace("--ds-", "")}</span><span>${t.value}</span><span class="ruler__bar" style="--w: var(${t.name})"></span></div>`).join("");
  const motion = flat.filter((t) => t.path.startsWith("motion."));
  const main = [
    sheet("scale", "Scale", `<p class="ds-prose">A 4px base. Use the small steps inside a group and the large ones between groups; space-10 separates major sections.</p><div class="ruler">${ruler}</div>`),
    sheet("grid", "Grid", `<p class="ds-prose">Twelve columns, a 20px gutter, a fluid margin from 16 to 40px and a 1440px maximum. <code>.ds-grid</code> gives you the sheet.</p><div class="gridview" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span>`).join("")}</div>
${code(`<div class="ds-grid">
  <article style="grid-column: 3 / span 7">…</article>
</div>`, "grid")}`),
    sheet("shape", "Corners and rules", `<div class="ds-table-wrap"><table class="ds-table"><thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead><tbody>
<tr><td><code>--ds-radius-none</code></td><td>0</td><td>Everything</td></tr>
<tr><td><code>--ds-radius-round</code></td><td>999px</td><td>Radio dots and true circles only</td></tr>
<tr><td><code>--ds-border-hairline</code></td><td>1px</td><td>Dividers, frames, table rows</td></tr>
<tr><td><code>--ds-border-rule</code></td><td>2px</td><td>Section openings, selected and current state</td></tr>
</tbody></table></div>`),
    sheet("motion", "Motion", `<p class="ds-prose">One curve, exponential ease-out, from a visible default. The band setting down is the only entrance; everything else answers input.</p>
<div class="split"><svg class="curve" viewBox="0 0 200 200" role="img" aria-label="Ease-out curve"><line x1="0" y1="200" x2="200" y2="200"/><line x1="0" y1="0" x2="0" y2="200"/><path d="M0 200 C 32 0, 60 0, 200 0"/></svg>
<div class="ds-table-wrap"><table class="ds-table"><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>${motion.map((t) => `<tr><td><code>${t.name}</code></td><td>${esc(t.value)}</td></tr>`).join("")}</tbody></table></div></div>
<div class="stack"><div class="motion-demo" style="width:100%"><i></i></div><button class="ds-button" type="button" data-motion-play>Play 640ms ease-out</button></div>`),
  ].join("\n");
  const nest = ["3", "4", "5", "6"].reduceRight((inner, n) => `<div class="inset" style="padding:var(--ds-space-${n})"><span>space-${n}</span>${inner}</div>`, `<div class="inset__core">Content</div>`);
  const aside = `<figure class="ds-plate"><div class="ds-plate__stage wide">${nest}</div><figcaption class="ds-plate__caption"><span>Nested insets</span><span>3 · 4 · 5 · 6</span></figcaption></figure>`;
  return layout(page, { aside, main, sections });
};

pages.components = (page) => {
  const sections = components.map((c) => [c.slug, c.name]);
  const main = components
    .map((c) => {
      const id = c.slug;
      const tags = c.surfaces.map((s) => `<span class="ds-tag">${s}</span>`).join(" ");
      const stageClass = ["field", "select", "callout", "table", "stat", "code", "tabs", "slide", "masthead", "band", "plate"].includes(id) ? "ds-plate__stage wide" : "ds-plate__stage";
      const body = `<p class="ds-prose">${esc(c.summary)}</p>
<div class="ds-tabs">
  <div class="ds-tabs__list" role="tablist" aria-label="${esc(c.name)} views">
    <button class="ds-tabs__tab" role="tab" aria-selected="true" aria-controls="${id}-preview" id="${id}-tab-preview">Preview</button>
    <button class="ds-tabs__tab" role="tab" aria-selected="false" aria-controls="${id}-code" id="${id}-tab-code" tabindex="-1">HTML</button>
  </div>
  <div class="ds-tabs__panel" role="tabpanel" id="${id}-preview" aria-labelledby="${id}-tab-preview">
    <figure class="ds-plate"><div class="${stageClass}"${["field", "callout", "stat"].includes(id) ? ' style="display:grid;gap:var(--ds-space-5)"' : ""}>${c.markup.replace(/ id="/g, ` id="${id}-demo-`).replace(/ for="/g, ` for="${id}-demo-`).replace(/aria-(describedby|controls|labelledby)="/g, `aria-$1="${id}-demo-`)}</div>
    <figcaption class="ds-plate__caption"><span>${esc(c.name)}</span><span>.ds-${c.slug}</span></figcaption></figure>
  </div>
  <div class="ds-tabs__panel" role="tabpanel" id="${id}-code" aria-labelledby="${id}-tab-code" hidden>${code(c.markup, `${c.slug}.html`)}</div>
</div>
<div class="split">
  <div><p class="ds-label rules-title">Use</p><ul class="rules">${c.use.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></div>
  <div><p class="ds-label rules-title">Avoid</p><ul class="rules" data-kind="avoid">${c.avoid.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></div>
</div>
<p class="meta-line">States: ${esc(c.states.join(" · "))}</p>`;
      return sheet(id, c.name, body, `<span class="row">${tags}</span>`);
    })
    .join("\n");
  const aside = `<ol class="index-list">${components.map((c) => `<li><a href="#${c.slug}"><span>${c.name}</span></a></li>`).join("")}</ol>`;
  return layout(page, { aside, main, sections: [], wide: true });
};

pages.surfaces = (page) => {
  const sections = surfaces.map((s) => [s.slug, s.name]);
  const examples = {
    site: `<section class="ds-band" data-ink="oxide"><div class="ds-band__inner" style="min-height:14rem"><p class="ds-band__word" style="font-size:clamp(3rem,9vw,7rem)">Work</p><p class="ds-band__summary">Selected projects, 2019 to now.</p></div></section>`,
    tools: `<div class="stack" style="padding:var(--ds-space-5)"><div class="ds-field"><label class="ds-field__label" for="ex-url">Feed URL</label><input class="ds-input" id="ex-url" placeholder="https://example.com/feed.xml"></div><label class="ds-check"><input type="checkbox" checked> Check daily</label><div class="row"><button class="ds-button" data-variant="primary" type="button">Add feed</button><button class="ds-button" type="button">Cancel</button></div></div>`,
    dashboards: `<div style="padding:var(--ds-space-5);display:grid;gap:var(--ds-space-6)"><div class="stats"><div class="ds-stat"><span class="ds-stat__label">Visits, 30 days</span><span class="ds-stat__value">3,412</span><span class="ds-stat__delta" data-trend="up">+12% vs Sept</span></div><div class="ds-stat"><span class="ds-stat__label">Notes published</span><span class="ds-stat__value">9</span><span class="ds-stat__delta">Same as Sept</span></div><div class="ds-stat"><span class="ds-stat__label">Build time</span><span class="ds-stat__value">41<span class="ds-stat__unit">s</span></span><span class="ds-stat__delta" data-trend="down">−6s vs Sept</span></div></div>${components.find((c) => c.slug === "table").markup}</div>`,
    docs: `<div class="stack" style="padding:var(--ds-space-5)"><h3 style="font-size:var(--ds-text-h2)">Deploying</h3><div class="ds-prose"><p>Run the build, then deploy the Worker. Static pages are served from <code>dist/</code>; only <code>/mcp</code> and <code>/api</code> run code.</p></div>${components.find((c) => c.slug === "callout").markup.split("\n<aside")[0]}</div>`,
    slides: `<div style="padding:var(--ds-space-5);display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:var(--ds-space-4)">${components.find((c) => c.slug === "slide").markup.replace('data-ink="oxide"', 'data-ink="violet"')}<section class="ds-slide"><header class="ds-slide__head"><span>Building for one</span><span>Tokens</span></header><div class="ds-slide__body"><h2 class="ds-slide__title" style="font-size:5cqi;font-weight:500">One file, every surface</h2><p class="ds-slide__text">tokens.json feeds ds.css, the docs and the MCP server.</p></div><footer class="ds-slide__foot"><span>Magnus</span><span>08 / 24</span></footer></section></div>`,
  };
  const main = surfaces
    .map((s) =>
      sheet(
        s.slug,
        s.name,
        `<ul class="rules">${s.guidance.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>${s.slug === "slides" ? `<p class="row"><a class="ds-button" data-variant="primary" href="/deck">Open the example deck</a><a class="ds-button" href="/api/templates/deck.html">Download the template</a></p>` : ""}
<figure class="ds-plate"><div class="ds-plate__stage wide" style="padding:0">${examples[s.slug]}</div><figcaption class="ds-plate__caption"><span>${esc(s.name)}, example</span><span>ink: ${s.ink}</span></figcaption></figure>`,
        `<span class="row"><span class="ds-tag">${esc(s.mode)}</span><span class="ds-tag" data-ink="${s.ink}">${s.ink}</span></span>`
      )
    )
    .join("\n");
  const aside = `<ol class="index-list">${surfaces.map((s) => `<li><a href="#${s.slug}"><span>${s.name}</span><small>${s.mode.split(" ")[0]}</small></a></li>`).join("")}</ol>`;
  return layout(page, { aside, main, sections });
};

pages.mcp = (page) => {
  const sections = [["connect", "Connect"], ["claude-desktop", "Claude on Mac"], ["tools", "Tools"], ["resources", "Resources"], ["api", "HTTP API"], ["deploy", "Deploy"]];
  const tools = [
    ["get_principles", "surface?", "The rules, plus guidance for site, tools, dashboards, docs or slides."],
    ["get_tokens", "format?, group?", "Tokens as css, flat JSON or the DTCG source, optionally filtered (color.section, font.size)."],
    ["list_components", "", "Every component with its slug, summary and surfaces."],
    ["get_template", "name, self_contained?", "A starter file. \"deck\" is a slide deck with every layout."],
    ["get_component", "name", "Canonical HTML, use and avoid rules, and states for one component."],
  ];
  const main = [
    sheet("connect", "Connect", `<p class="lead">The Worker serves a read-only MCP server at <code>/mcp</code> over Streamable HTTP. It is stateless and needs no auth, because everything it returns is already public on this site.</p>
${code(`claude mcp add --transport http design-system https://ds.example.dev/mcp`, "Claude Code", true)}
${code(`{
  "mcpServers": {
    "design-system": {
      "type": "http",
      "url": "https://ds.example.dev/mcp"
    }
  }
}`, ".mcp.json", true)}
<aside class="ds-callout"><p class="ds-callout__title">Tell the agent to use it</p><p class="ds-callout__body">Add a line to the project's CLAUDE.md or agent instructions: "Build UI with the design-system MCP server. Call get_principles first."</p></aside>`),
    sheet("claude-desktop", "Claude on Mac", `<p class="ds-prose">The Claude desktop app adds remote MCP servers as connectors. The server has to be deployed: Claude reaches connectors from Anthropic's side, so <code>localhost</code> won't work there.</p>
<ol class="ds-prose">
<li>Open Claude, then Settings, then Connectors.</li>
<li>Choose Add custom connector. Name it Design system and paste the URL below. Leave the OAuth fields empty; the server needs no sign-in.</li>
<li>In a chat, open the tools menu and turn the connector on. Then ask, for example: "Use the design system to make a ten-slide deck about my garden project."</li>
</ol>
${code(`https://ds.example.dev/mcp`, "Connector URL", true)}
<p class="ds-prose">Connectors you add in the app also work in Claude on the web and on your phone. To try the server before deploying, the desktop app can run a local bridge instead: add this to <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> and restart Claude.</p>
${code(`{
  "mcpServers": {
    "design-system": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8787/mcp"]
    }
  }
}`, "claude_desktop_config.json")}
<aside class="ds-callout"><p class="ds-callout__title">Slides from Claude</p><p class="ds-callout__body">Ask for a deck and Claude calls get_template with name deck, then rewrites the slides. Save the result as an .html file and open it in a browser: P presents, S opens the speaker view, PDF exports.</p></aside>`),
    sheet("tools", "Tools", `<div class="ds-table-wrap"><table class="ds-table"><thead><tr><th>Tool</th><th>Arguments</th><th>Returns</th></tr></thead><tbody>${tools.map(([n, a, d]) => `<tr><td><code>${n}</code></td><td><code>${a || "none"}</code></td><td>${d}</td></tr>`).join("")}</tbody></table></div>`),
    sheet("resources", "Resources", `<div class="ds-table-wrap"><table class="ds-table"><thead><tr><th>URI</th><th>Content</th></tr></thead><tbody>
<tr><td><code>ds://tokens.json</code></td><td>DTCG token source</td></tr>
<tr><td><code>ds://tokens.css</code></td><td>Custom properties, light and dark</td></tr>
<tr><td><code>ds://principles</code></td><td>Principles and surface guidance, Markdown</td></tr>
<tr><td><code>ds://design.md</code></td><td>The full rulebook: tokens, rules and components in one file</td></tr>
<tr><td><code>ds://components/{slug}</code></td><td>One component, Markdown with markup</td></tr>
</tbody></table></div>`),
    sheet("api", "HTTP API", `<p class="ds-prose">The same data as plain JSON, with CORS open, for build tools and scripts.</p><div class="ds-table-wrap"><table class="ds-table"><thead><tr><th>Path</th><th>Returns</th></tr></thead><tbody>
<tr><td><a class="ds-link" href="/api/tokens"><code>/api/tokens</code></a></td><td>tokens.json</td></tr>
<tr><td><a class="ds-link" href="/api/tokens/flat"><code>/api/tokens/flat</code></a></td><td>Flat list with variable names</td></tr>
<tr><td><a class="ds-link" href="/api/components"><code>/api/components</code></a></td><td>The component catalogue</td></tr>
<tr><td><a class="ds-link" href="/api/components/button"><code>/api/components/{slug}</code></a></td><td>One component</td></tr>
</tbody></table></div>`),
    sheet("deploy", "Deploy", `${code(`npm install
npm run dev      # wrangler dev, builds first
npm test         # MCP protocol tests
npm run deploy   # wrangler deploy`, "terminal")}`),
  ].join("\n");
  const aside = `<ol class="index-list">${tools.map(([n]) => `<li><a href="#tools"><span>${n}</span></a></li>`).join("")}</ol>`;
  return layout(page, { aside, main, sections });
};

function notFound() {
  const page = { slug: "404", href: "/404", word: "Missing", nav: "Not found", ink: "sienna", summary: "Nothing is printed on this sheet." };
  return `${head(page, { noindex: true })}
<body>
${masthead(page)}
<main id="main">
<section class="ds-band" data-ink="sienna"><div class="ds-band__inner"><h1 class="ds-band__word">404</h1><p class="ds-band__summary">Nothing is printed on this sheet. Start again from the <a class="ds-link" href="/">overview</a>.</p></div></section>
</main>
${footer()}
</body></html>`;
}

const favicon = markSVG({ size: 32, inset: 4 });

const manifest = {
  name: SITE.name,
  short_name: "Design System",
  description: SITE.description,
  start_url: "/",
  display: "standalone",
  background_color: tok("color.paper.base").value,
  theme_color: tok("color.section.ultramarine").value,
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /mcp

Sitemap: ${abs("/sitemap.xml")}
`;

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...PAGES.map((p) => p.href), "/deck"].map((h) => `  <url><loc>${abs(h)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;

// For language models: what this is and where the machine-readable parts live.
const llms = `# ${SITE.name}

> ${SITE.description}

Use the MCP server for anything you build: it returns the rules, tokens and exact component markup.

## Machine-readable
- [MCP server](${abs("/mcp")}): Streamable HTTP, read-only. Tools: get_principles, get_tokens, list_components, get_component.
- [DESIGN.md](${abs("/DESIGN.md")}): the full rulebook in one file
- [tokens.json](${abs("/api/tokens")}): design tokens, W3C format
- [Components](${abs("/api/components")}): catalogue with markup, as JSON
- [ds.css](${abs("/ds.css")}): the stylesheet to link
- [Deck template](${abs("/api/templates/deck.html")}): a starter slide deck; deck.css and deck.js add layouts and presenting

## Docs
${PAGES.map((p) => `- [${p.nav}](${abs(p.href)}): ${p.summary}`).join("\n")}
`;

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'sha256-${THEME_HASH}'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Security headers everywhere; CORS so other projects can load the stylesheet and fonts.
const headers = `/*
  Content-Security-Policy: ${CSP}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
/ds.css
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
/tokens.css
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
/fonts/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
/og/*
  Cache-Control: public, max-age=86400
/*.png
  Cache-Control: public, max-age=86400
`;

// The live example deck at /deck: the template, loading the system from this site.
const deckPage = fillTemplate(await read("templates/deck.html"), {
  ...templateValues("", SITE.url),
  HEAD: `<meta name="description" content="An example deck built with the design system: every slide layout, with presenting, speaker notes and PDF export.">
<link rel="canonical" href="${abs("/deck")}">
<meta property="og:title" content="Building for one: an example deck">
<meta property="og:image" content="${abs("/og/surfaces.png")}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
});

// ---- Write ----
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
const tokensCSS = toCSS(tokens);
const dsCSS = [tokensCSS, await read("css/base.css"), await read("css/components.css")].join("\n");
await Promise.all([
  writeFile(join(DIST, "tokens.css"), tokensCSS),
  writeFile(join(DIST, "ds.css"), dsCSS),
  writeFile(join(DIST, "docs.css"), await read("css/docs.css")),
  writeFile(join(DIST, "docs.js"), await read("js/docs.js")),
  writeFile(join(DIST, "tokens.json"), JSON.stringify(tokens, null, 2)),
  writeFile(join(DIST, "favicon.svg"), favicon),
  writeFile(join(DIST, "_headers"), headers),
  writeFile(join(DIST, "site.webmanifest"), JSON.stringify(manifest, null, 2)),
  writeFile(join(DIST, "robots.txt"), robots),
  writeFile(join(DIST, "sitemap.xml"), sitemap),
  writeFile(join(DIST, "llms.txt"), llms),
  writeFile(join(DIST, "deck.css"), await read("css/deck.css")),
  writeFile(join(DIST, "deck.js"), await read("js/deck.js")),
  writeFile(join(DIST, "deck.html"), deckPage),
  mkdir(join(DIST, "templates"), { recursive: true }).then(async () => writeFile(join(DIST, "templates/deck.html"), await read("templates/deck.html"))),
  cp(join(SRC, "assets/brand"), DIST, { recursive: true }),
  cp(join(SRC, "assets/og"), join(DIST, "og"), { recursive: true }),
  writeFile(join(DIST, "404.html"), notFound()),
  cp(join(SRC, "assets/fonts"), join(DIST, "fonts"), { recursive: true }),
  cp(join(ROOT, "DESIGN.md"), join(DIST, "DESIGN.md")),
  ...PAGES.map((p) => writeFile(join(DIST, p.file), pages[p.slug](p))),
]);
if (SITE.url.includes("example.dev")) console.warn("SITE_URL is not set: canonical URLs and share images point at the placeholder " + SITE.url);
console.log(`Built dist/: ${PAGES.length} pages, ${flat.length} tokens, ${components.length} components.`);
