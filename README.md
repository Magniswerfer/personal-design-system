# personal-design-system

Magnus's personal design system: a Swiss type specimen printed with one ink per section. Plain CSS and HTML, a docs site, and a read-only MCP server, all deployed as one Cloudflare Worker.

## Layout

```
src/tokens/tokens.json     single source of truth (W3C design tokens format)
src/tokens/flatten.mjs     tokens -> CSS custom properties (shared by build and Worker)
src/css/base.css           faces, element defaults, .ds-prose, .ds-grid
src/css/components.css     the components (.ds-*)
src/content/*.mjs          component catalogue, principles, surface guidance
src/css/deck.css, src/js/deck.js  slide layouts, presenting, speaker view, PDF
src/templates/deck.html    the deck starter (served at /deck and via MCP)
src/brand/mark.mjs         the mark: the section rail in miniature (favicon, icons)
src/assets/brand, og/      rendered icons and share images (npm run assets)
src/content/site.mjs       site name, SITE_URL, page map
src/css/docs.css, src/js/docs.js  docs site chrome only
scripts/build.mjs          builds dist/: ds.css, tokens.css, tokens.json, docs pages
worker/index.js            Worker: static assets + /api/*
worker/mcp.js              MCP server (Streamable HTTP, stateless, no dependencies)
test/                      MCP protocol tests
```

## Use it in a project

```html
<link rel="stylesheet" href="https://personal-design-system.magnushoholt.workers.dev/ds.css">
```

Then copy the markup from `/components`. Pick one section ink per project with `data-ink="oxide|chrome|grass|teal|ultramarine|violet|sienna"`. Dark mode follows the OS, or set `data-theme="dark"` on `<html>`.

## Slides

Open `/deck` for the example deck, or download a starter from `/api/templates/deck.html` (`?inline=1` for a single self-contained file). A deck is a `.ds-deck` of `.ds-slide` sections with a `data-layout`: title, section, statement, list, split, stats, quote, code, image, end. In the browser: P presents, S opens the speaker view, F goes fullscreen, PDF prints one 16:9 page per slide.

## Agents (MCP)

```sh
claude mcp add --transport http design-system https://personal-design-system.magnushoholt.workers.dev/mcp
```

Tools: `get_principles`, `get_tokens`, `list_components`, `get_component`, `get_template`. Resources: `ds://tokens.json`, `ds://tokens.css`, `ds://principles`, `ds://design.md`, `ds://components/{slug}`.

Claude on Mac: Settings → Connectors → Add custom connector, URL `https://personal-design-system.magnushoholt.workers.dev/mcp` (needs the deployed server). The `/mcp-server` page has the local `mcp-remote` alternative.

## Develop and deploy

```sh
npm install
npm run dev      # builds, then wrangler dev on :8787
npm test
npm run deploy   # wrangler deploy (log in first with npx wrangler login)
npm run assets   # re-render icons and share images (needs Playwright's Chromium)
```

Set the public origin before deploying, so canonical URLs, the sitemap and share images are absolute: `SITE_URL=https://your.domain npm run deploy`, or change the fallback in `src/content/site.mjs`.

Change values in `tokens.json` and components in `src/`. Never edit `dist/`; it is regenerated on every dev and deploy.

Fonts (Familjen Grotesk, Source Serif 4, JetBrains Mono) are self-hosted under the SIL Open Font License.
