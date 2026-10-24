// Site identity and the page map. Shared by the build and the asset renderer.
import { components } from "./components.mjs";

export const SITE = {
  name: "Magnus Design System",
  description: "A personal design system: a Swiss type specimen printed with one ink per section. Tokens, plain CSS components, docs and an MCP server for agents.",
  author: "Magnus",
  locale: "en_GB",
  // Absolute origin used for canonical URLs, the sitemap and share images.
  // The workers.dev address; set SITE_URL when building to use a custom domain instead.
  url: (process.env.SITE_URL || "https://personal-design-system.magnushoholt.workers.dev").replace(/\/$/, ""),
};

// Ink per section; the overview rail and the mark follow this order.
export const PAGES = [
  { slug: "index", file: "index.html", href: "/", word: "System", nav: "Overview", ink: "ultramarine", summary: "A personal design system: one sheet, one ink per section, served to people and agents alike." },
  { slug: "colour", file: "colour.html", href: "/colour", word: "Colour", nav: "Colour", ink: "oxide", summary: "Paper, ink and seven section inks that double as the data palette." },
  { slug: "type", file: "type.html", href: "/type", word: "Type", nav: "Type", ink: "teal", summary: "A grotesk for structure, a serif for reading, a mono for values." },
  { slug: "space", file: "space.html", href: "/space", word: "Space", nav: "Space", ink: "grass", summary: "A 4px scale, a 12-column sheet, square corners and one way to move." },
  { slug: "components", file: "components.html", href: "/components", word: "Parts", nav: "Components", ink: "chrome", summary: `${components.length} components in plain HTML and CSS. Copy the markup; load ds.css.` },
  { slug: "surfaces", file: "surfaces.html", href: "/surfaces", word: "Surfaces", nav: "Surfaces", ink: "violet", summary: "How the system bends for a site, a tool, a dashboard, a document and a deck." },
  { slug: "mcp", file: "mcp-server.html", href: "/mcp-server", word: "Agents", nav: "MCP", ink: "sienna", summary: "Everything on this site, served over MCP so agents build with it too." },
];
