import { test } from "node:test";
import assert from "node:assert/strict";
import { handleMcp } from "../worker/mcp.js";

const call = async (body, init = {}) => {
  const res = await handleMcp(
    new Request("https://ds.test/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: typeof body === "string" ? body : JSON.stringify(body),
      ...init,
    })
  );
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};
const rpc = (method, params, id = 1) => call({ jsonrpc: "2.0", id, method, params });

test("initialize negotiates the protocol version", async () => {
  const { body } = await rpc("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "1" } });
  assert.equal(body.result.protocolVersion, "2025-03-26");
  assert.ok(body.result.capabilities.tools);
  assert.ok(body.result.instructions.includes("get_principles"));
  const unknown = await rpc("initialize", { protocolVersion: "1999-01-01" });
  assert.equal(unknown.body.result.protocolVersion, "2025-06-18");
});

test("notifications get 202 with no body", async () => {
  const { status, body } = await call({ jsonrpc: "2.0", method: "notifications/initialized" });
  assert.equal(status, 202);
  assert.equal(body, null);
});

test("tools/list exposes the five read tools", async () => {
  const { body } = await rpc("tools/list");
  assert.deepEqual(body.result.tools.map((t) => t.name).sort(), ["get_component", "get_principles", "get_template", "get_tokens", "list_components"]);
});

test("get_tokens filters a group and renders css", async () => {
  const { body } = await rpc("tools/call", { name: "get_tokens", arguments: { group: "color.section", format: "flat" } });
  const names = body.result.structuredContent.tokens.map((t) => t.name);
  assert.ok(names.includes("--ds-section-oxide"));
  assert.ok(names.every((n) => n.startsWith("--ds-section-")));
  const css = await rpc("tools/call", { name: "get_tokens", arguments: { format: "css" } });
  assert.match(css.body.result.content[0].text, /:root\[data-theme="dark"\]/);
});

test("get_component returns markup, unknown names are tool errors", async () => {
  const ok = await rpc("tools/call", { name: "get_component", arguments: { name: "Button" } });
  assert.match(ok.body.result.structuredContent.markup, /ds-button/);
  const bad = await rpc("tools/call", { name: "get_component", arguments: { name: "carousel" } });
  assert.equal(bad.body.result.isError, true);
});

test("get_principles takes a surface", async () => {
  const { body } = await rpc("tools/call", { name: "get_principles", arguments: { surface: "dashboards" } });
  assert.equal(body.result.structuredContent.surface.slug, "dashboards");
});

test("resources list and read", async () => {
  const list = await rpc("resources/list");
  const uris = list.body.result.resources.map((r) => r.uri);
  assert.ok(uris.includes("ds://components/table"));
  const read = await rpc("resources/read", { uri: "ds://components/table" });
  assert.match(read.body.result.contents[0].text, /ds-table/);
  const missing = await rpc("resources/read", { uri: "ds://nope" });
  assert.equal(missing.body.error.code, -32002);
});

test("design.md resource reads through the asset loader", async () => {
  const res = await handleMcp(
    new Request("https://ds.test/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "resources/read", params: { uri: "ds://design.md" } }) }),
    async (path) => (path === "/DESIGN.md" ? "# Design" : null)
  );
  assert.equal((await res.json()).result.contents[0].text, "# Design");
});

test("protocol errors", async () => {
  assert.equal((await call("{not json")).body.error.code, -32700);
  assert.equal((await rpc("does/not/exist")).body.error.code, -32601);
  assert.equal((await rpc("tools/call", { name: "nope" })).body.error.code, -32602);
  const get = await handleMcp(new Request("https://ds.test/mcp"));
  assert.equal(get.status, 405);
});

test("get_template returns the deck pointed at the request origin", async () => {
  const files = { "/templates/deck.html": '<link rel="stylesheet" href="{{BASE}}/ds.css">\n<link rel="stylesheet" href="{{BASE}}/deck.css">\n<script type="module" src="{{BASE}}/deck.js"></script><b>{{N_COMPONENTS}}</b>', "/ds.css": "a{}", "/deck.css": "b{}", "/deck.js": "go()" };
  const loader = async (p) => files[p] ?? null;
  const ask = async (args) => {
    const res = await handleMcp(new Request("https://ds.test/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_template", arguments: args } }) }), loader);
    return (await res.json()).result;
  };
  const linked = (await ask({ name: "deck" })).content[0].text;
  assert.match(linked, /href="https:\/\/ds\.test\/ds\.css"/);
  assert.match(linked, /<b>16<\/b>/);
  const inline = (await ask({ name: "deck", self_contained: true })).content[0].text;
  assert.match(inline, /<style>\na\{\}\nb\{\}\n<\/style>/);
  assert.match(inline, /<script type="module">\ngo\(\)\n<\/script>/);
  assert.equal((await ask({ name: "nope" })).isError, true);
});
