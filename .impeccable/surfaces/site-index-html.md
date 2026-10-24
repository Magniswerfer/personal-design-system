---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: ["site"]
---

# Docs site (design system reference)

Mode: Read. The docs site is the system's own reference and its first surface. Every page is also served as structured data over MCP.

Reader: the owner looking up a token, a component's markup, or a rule, and AI agents fetching the same data over MCP. Task: find the answer in seconds, then copy it.

Pages: Overview (principles), Colour, Type, Space (grid, radius, motion), Components, Surfaces (site, tools, dashboards, docs, slides), MCP.

User steer: Grotesk Specimen for structure, type and grid; the Acetate Tab Manual's section hues for colour.

## Direction contract

THESIS: The system as a Swiss type specimen printed with one ink per section. It refuses the default docs layout (sidebar tree, Inter, blue accent, rounded preview cards).

OWN-WORLD: Near-white specimen paper and black ink on a strict 12-column grid with 1px ink hairlines and square corners. Familjen Grotesk carries structure and display, Source Serif 4 carries reading, JetBrains Mono carries values and code. Seven section inks (oxide, chrome yellow, grass, teal, ultramarine, violet, sienna) each fill their section's full-width opener band and double as the categorical data palette. State is shown by form (rule weight, fill, strike), never by colour alone.

STORY: The reader knows which section they're in from its ink and opener word, finds the entry through the top nav and the in-page index, reads one rule, and copies the token or markup.

FIRST VIEWPORT: Top bar (wordmark left, section nav following it, theme toggle right), closed by a 4px rule in the section ink that stays visible after the band scrolls away. A full-bleed band in the section's ink holds the section word in monumental grotesk across columns 3–12 with a one-line summary. Below it, a 3/7/2 split: a specimen or index on the left, the reading column in the middle, and "on this page" on the right. Amended from 4/5/3 during the build: code blocks, tables and component plates need seven columns, and prose stays capped at 66ch inside them. The nav follows the wordmark instead of starting at column 4, so that seven sections fit at 1280px.

FORM: Grotesk Specimen (my top grounded pick, chosen by the user) fused with the colour board of the Acetate Tab Manual (rw-manual-acetate-tab-board). seed:93697ad8c7068f2a

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
