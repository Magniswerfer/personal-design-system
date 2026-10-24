// Turns tokens.json (DTCG) into flat CSS custom properties.
// Shared by the build script and the Worker so the docs, ds.css and MCP agree.

const PREFIX = "ds";

// Group path -> custom property stem. Unlisted groups use the path as-is.
const STEMS = {
  "color": "",
  "font.family": "font",
  "font.weight": "weight",
  "font.size": "text",
  "font.leading": "leading",
  "font.tracking": "tracking",
  "font.measure": "measure",
  "motion.duration": "duration",
  "motion.ease": "ease",
};

function cssValue(token, type) {
  const v = token.$value;
  if (type === "fontFamily") return v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(", ");
  if (type === "cubicBezier") return `cubic-bezier(${v.join(", ")})`;
  return String(v);
}

function varName(path) {
  // Longest matching group prefix wins.
  const joined = path.join(".");
  const key = Object.keys(STEMS)
    .filter((k) => joined === k || joined.startsWith(k + "."))
    .sort((a, b) => b.length - a.length)[0];
  const rest = key ? path.slice(key.split(".").length) : path;
  const parts = [key ? STEMS[key] : null, ...rest].filter(Boolean);
  if (parts.length > 1 && parts[parts.length - 1] === "base") parts.pop();
  return `--${PREFIX}-${parts.join("-")}`;
}

/** Walk the tree and return [{ path, name, type, value, dark?, on?, description? }]. */
export function flatten(tree, path = [], inheritedType) {
  const out = [];
  const type = tree.$type ?? inheritedType;
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$") || typeof node !== "object" || node === null) continue;
    const p = [...path, key];
    if ("$value" in node) {
      const t = node.$type ?? type;
      const ext = node.$extensions ?? {};
      const name = varName(p);
      out.push({
        path: p.join("."),
        name,
        type: t,
        value: cssValue(node, t),
        ...(ext.dark && { dark: ext.dark }),
        ...(node.$description && { description: node.$description }),
      });
      if (ext.on) out.push({ path: p.join(".") + ".on", name: `${name}-on`, type: t, value: ext.on, description: `Text on ${key}.` });
    } else {
      out.push(...flatten(node, p, type));
    }
  }
  return out;
}

/** CSS for :root plus both ways of asking for dark (explicit attribute and OS preference). */
export function toCSS(tree) {
  const flat = flatten(tree);
  const light = flat.map((t) => `  ${t.name}: ${t.value};`).join("\n");
  const dark = flat.filter((t) => t.dark).map((t) => `  ${t.name}: ${t.dark};`).join("\n");
  return `/* Generated from src/tokens/tokens.json. Do not edit by hand. */
:root {
  color-scheme: light;
${light}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${dark.replace(/^/gm, "  ")}
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
${dark}
}
`;
}
