// A read-only MCP server over Streamable HTTP, stateless, no dependencies.
// Every request is a JSON-RPC POST answered with a single JSON response.

import tokens from "../src/tokens/tokens.json" with { type: "json" };
import { flatten, toCSS } from "../src/tokens/flatten.mjs";
import { components, findComponent } from "../src/content/components.mjs";
import { principles, surfaces, findSurface } from "../src/content/principles.mjs";
import { fillTemplate, inlineTemplate } from "../src/templates/fill.mjs";

const SERVER_INFO = { name: "personal-design-system", title: "Magnus Design System", version: "0.1.0" };
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCTIONS = `This server describes Magnus's personal design system. Use it before building any UI for Magnus.
1. Call get_principles (optionally with a surface: site, tools, dashboards, docs, slides) for the rules.
2. Call get_tokens for colour, type, space and motion values. Prefer the CSS custom properties (--ds-*) over raw values.
3. Call list_components, then get_component for exact markup. Link ds.css from this server's origin and copy markup as given.
4. For slides, call get_template with name "deck" and replace its slides with the talk's content.
5. For the complete rulebook in one file, read the resource ds://design.md.`;

const TOOLS = [
  {
    name: "get_principles",
    title: "Get design principles",
    description: "The design system's rules, plus guidance for one surface type when given.",
    inputSchema: {
      type: "object",
      properties: { surface: { type: "string", enum: surfaces.map((s) => s.slug), description: "Optional surface type." } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_tokens",
    title: "Get design tokens",
    description: "Design tokens as CSS custom properties, a flat list, or the DTCG JSON source. Filter with group (e.g. color, font, space, motion, color.section).",
    inputSchema: {
      type: "object",
      properties: {
        format: { type: "string", enum: ["css", "flat", "dtcg"], default: "flat" },
        group: { type: "string", description: "Dot path prefix, such as color.section or font.size." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_components",
    title: "List components",
    description: "Every component with its slug, one-line summary and the surfaces it suits.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_template",
    title: "Get a starter template",
    description: "A complete starter file built on the system. \"deck\" is a slide deck showing every slide layout (title, section, statement, list, split, stats, quote, code, image, end) with presenting, speaker notes and PDF export. Edit its slides; keep its structure. Set self_contained to inline the CSS and JS so the file works when opened locally.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", enum: ["deck"] },
        self_contained: { type: "boolean", default: false },
      },
      required: ["name"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_component",
    title: "Get a component",
    description: "One component's canonical HTML, usage rules, things to avoid and its states.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Slug or name, e.g. button, field, table." } },
      required: ["name"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

// BASE is where the file loads the system from ("" on this site); ORIGIN is the address shown on slides.
export function templateValues(base, origin = base) {
  return { BASE: base, ORIGIN: origin, HEAD: "", N_TOKENS: flatten(tokens).length, N_COMPONENTS: components.length, N_TOOLS: TOOLS.length };
}

function subtree(tree, group) {
  if (!group) return tree;
  let node = tree;
  for (const key of group.split(".")) {
    node = node?.[key];
    if (!node || typeof node !== "object") return null;
  }
  return { [group]: node };
}

function filterFlat(group) {
  const all = flatten(tokens);
  return group ? all.filter((t) => t.path === group || t.path.startsWith(group + ".")) : all;
}

class ToolError extends Error {}

function text(t, structured) {
  return { content: [{ type: "text", text: t }], ...(structured && { structuredContent: structured }) };
}

const handlers = {
  // ctx: { loadText(path), origin } for tools that read deployed files.
  async get_template({ name, self_contained = false } = {}, ctx) {
    if (name !== "deck") throw new ToolError(`No template "${name}". Available: deck.`);
    const raw = await ctx.loadText("/templates/deck.html");
    if (!raw) throw new ToolError("The deck template is not deployed.");
    let html = fillTemplate(raw, templateValues(ctx.origin));
    if (self_contained) {
      const [dsCSS, deckCSS, deckJS] = await Promise.all(["/ds.css", "/deck.css", "/deck.js"].map((p) => ctx.loadText(p)));
      html = inlineTemplate(html, { base: ctx.origin, dsCSS, deckCSS, deckJS });
    }
    return text(html);
  },

  get_principles({ surface } = {}) {
    const s = surface ? findSurface(surface) : null;
    if (surface && !s) throw new ToolError(`Unknown surface "${surface}". Use one of: ${surfaces.map((x) => x.slug).join(", ")}.`);
    const data = { principles, ...(s ? { surface: s } : { surfaces }) };
    const md = [
      "# Principles",
      ...principles.map((p) => `## ${p.title}\n${p.body}`),
      ...(s
        ? [`# Surface: ${s.name} (${s.mode})`, `Suggested ink: ${s.ink}`, ...s.guidance.map((g) => `- ${g}`)]
        : ["# Surfaces", ...surfaces.map((x) => `- ${x.slug}: ${x.name} (${x.mode})`)]),
    ].join("\n\n");
    return text(md, data);
  },

  get_tokens({ format = "flat", group } = {}) {
    if (format === "dtcg") {
      const tree = subtree(tokens, group);
      if (!tree) throw new ToolError(`No token group "${group}".`);
      return text(JSON.stringify(tree, null, 2), tree);
    }
    const flat = filterFlat(group);
    if (!flat.length) throw new ToolError(`No tokens match "${group}".`);
    if (format === "css") {
      return text(group ? flat.map((t) => `${t.name}: ${t.value};${t.dark ? ` /* dark: ${t.dark} */` : ""}`).join("\n") : toCSS(tokens));
    }
    if (format === "flat") return text(JSON.stringify(flat, null, 2), { tokens: flat });
    throw new ToolError(`Unknown format "${format}". Use css, flat or dtcg.`);
  },

  list_components() {
    const list = components.map(({ slug, name, summary, surfaces }) => ({ slug, name, summary, surfaces }));
    return text(list.map((c) => `- ${c.slug}: ${c.summary}`).join("\n"), { components: list });
  },

  get_component({ name } = {}) {
    const c = findComponent(name);
    if (!c) throw new ToolError(`No component "${name}". Call list_components for the slugs.`);
    const md = [
      `# ${c.name}`,
      c.summary,
      "## Use",
      ...c.use.map((u) => `- ${u}`),
      "## Avoid",
      ...c.avoid.map((a) => `- ${a}`),
      "## States",
      c.states.join(", "),
      "## Markup",
      "```html\n" + c.markup + "\n```",
    ].join("\n");
    return text(md, c);
  },
};

function resourcesList() {
  return [
    { uri: "ds://tokens.json", name: "tokens.json", title: "Design tokens (DTCG)", mimeType: "application/json" },
    { uri: "ds://tokens.css", name: "tokens.css", title: "Design tokens as CSS custom properties", mimeType: "text/css" },
    { uri: "ds://principles", name: "principles", title: "Principles and surface guidance", mimeType: "text/markdown" },
    { uri: "ds://design.md", name: "DESIGN.md", title: "Full design rulebook", description: "Every token, rule and component, as one Markdown file.", mimeType: "text/markdown" },
    ...components.map((c) => ({ uri: `ds://components/${c.slug}`, name: c.slug, title: c.name, description: c.summary, mimeType: "text/markdown" })),
  ];
}

function readResource(uri) {
  if (uri === "ds://tokens.json") return { uri, mimeType: "application/json", text: JSON.stringify(tokens, null, 2) };
  if (uri === "ds://tokens.css") return { uri, mimeType: "text/css", text: toCSS(tokens) };
  if (uri === "ds://principles") return { uri, mimeType: "text/markdown", text: handlers.get_principles().content[0].text };
  const m = /^ds:\/\/components\/([a-z-]+)$/.exec(uri);
  if (m && findComponent(m[1])) return { uri, mimeType: "text/markdown", text: handlers.get_component({ name: m[1] }).content[0].text };
  return null;
}

const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });

/** Handle one JSON-RPC message. Returns a response object, or null for notifications.
 *  `loadText(path)` fetches a static file (DESIGN.md) from the deployed assets. */
export async function handleMessage(msg, loadText = async () => null, origin = "") {
  const ctx = { loadText, origin };
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError(msg?.id, -32600, "Invalid request");
  }
  const { id, method, params = {} } = msg;
  const isNotification = id === undefined || id === null;
  if (isNotification) return null;

  switch (method) {
    case "initialize": {
      const asked = params.protocolVersion;
      const protocolVersion = PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0];
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false }, resources: { listChanged: false, subscribe: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const handler = handlers[params.name];
      if (!handler) return rpcError(id, -32602, `Unknown tool: ${params.name}`);
      try {
        return rpcResult(id, await handler(params.arguments ?? {}, ctx));
      } catch (err) {
        if (err instanceof ToolError) return rpcResult(id, { ...text(err.message), isError: true });
        throw err;
      }
    }
    case "resources/list":
      return rpcResult(id, { resources: resourcesList() });
    case "resources/templates/list":
      return rpcResult(id, { resourceTemplates: [] });
    case "resources/read": {
      if (params.uri === "ds://design.md") {
        const md = await loadText("/DESIGN.md");
        return md ? rpcResult(id, { contents: [{ uri: params.uri, mimeType: "text/markdown", text: md }] }) : rpcError(id, -32002, "DESIGN.md is not deployed");
      }
      const r = readResource(params.uri);
      return r ? rpcResult(id, { contents: [r] }) : rpcError(id, -32002, `Resource not found: ${params.uri}`);
    }
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });

/** HTTP entry point for /mcp. */
export async function handleMcp(request, loadText) {
  const origin = new URL(request.url).origin;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  // Stateless server: no server-initiated SSE stream to offer.
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST, OPTIONS", ...CORS } });

  let body;
  try {
    body = await request.json();
  } catch {
    return json(rpcError(null, -32700, "Parse error"), 400);
  }

  const messages = Array.isArray(body) ? body : [body];
  const responses = [];
  for (const msg of messages) {
    try {
      const r = await handleMessage(msg, loadText, origin);
      if (r) responses.push(r);
    } catch (err) {
      responses.push(rpcError(msg?.id, -32603, `Internal error: ${err.message}`));
    }
  }
  if (!responses.length) return new Response(null, { status: 202, headers: CORS });
  return json(Array.isArray(body) ? responses : responses[0]);
}
