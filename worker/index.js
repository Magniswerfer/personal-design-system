// Cloudflare Worker: static docs from dist/ (via the ASSETS binding), plus
// the MCP endpoint and a small JSON API. Only /mcp and /api/* reach this code.

import tokens from "../src/tokens/tokens.json" with { type: "json" };
import { flatten } from "../src/tokens/flatten.mjs";
import { components, findComponent } from "../src/content/components.mjs";
import { handleMcp, templateValues } from "./mcp.js";
import { fillTemplate, inlineTemplate } from "../src/templates/fill.mjs";

const api = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" },
  });

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    const loadText = async (path) => {
      const res = await env.ASSETS.fetch(new URL(path, request.url));
      return res.ok ? res.text() : null;
    };

    if (pathname === "/mcp") return handleMcp(request, loadText);

    // Downloadable deck starter, pointed at this origin. ?inline=1 inlines CSS and JS.
    if (pathname === "/api/templates/deck.html") {
      const origin = new URL(request.url).origin;
      let html = fillTemplate(await loadText("/templates/deck.html"), templateValues(origin));
      if (new URL(request.url).searchParams.has("inline")) {
        const [dsCSS, deckCSS, deckJS] = await Promise.all(["/ds.css", "/deck.css", "/deck.js"].map(loadText));
        html = inlineTemplate(html, { base: origin, dsCSS, deckCSS, deckJS });
      }
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": 'attachment; filename="deck.html"', "Access-Control-Allow-Origin": "*" },
      });
    }

    if (pathname === "/api/tokens") return api(tokens);
    if (pathname === "/api/tokens/flat") return api(flatten(tokens));
    if (pathname === "/api/components") return api(components);
    const m = /^\/api\/components\/([a-z-]+)$/.exec(pathname);
    if (m) {
      const c = findComponent(m[1]);
      return c ? api(c) : api({ error: `No component "${m[1]}"` }, 404);
    }
    if (pathname.startsWith("/api/")) return api({ error: "Not found" }, 404);

    return env.ASSETS.fetch(request);
  },
};
