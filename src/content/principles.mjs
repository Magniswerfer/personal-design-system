// Design principles and per-surface guidance. Served on /, /surfaces and over MCP.

export const principles = [
  {
    title: "A specimen, printed in one ink",
    body: "Every surface is a sheet of near-white paper and black ink on a 12-column grid. Each section, or each project, gets one ink from the section palette, and that ink fills a whole region: the opener band, a slide, a category. Never sprinkle inks as accents.",
  },
  {
    title: "Two voices that never swap",
    body: "Familjen Grotesk carries structure: display, headings, navigation, labels, controls and numbers. Source Serif 4 carries reading. JetBrains Mono is for code, token values and measurements, never as decoration.",
  },
  {
    title: "One word big enough to win",
    body: "A page opens with a single monumental word in the band. It is the only oversized type on the page; everything below it is set at reading and interface sizes so the hierarchy stays obvious.",
  },
  {
    title: "Square, ruled, flat",
    body: "Corners are square. Structure comes from hairline rules and the 2px rule that marks openings and selection, not from cards, shadows or tints. If something needs a container, it is a plate or a sunken field, never a nested card.",
  },
  {
    title: "State is drawn, not coloured",
    body: "Every state can be read in greyscale: disabled is dashed, selected and current get the 2px rule, errors get a heavier border and a sentence. Colour can reinforce a state but never carries it alone.",
  },
  {
    title: "One authored moment",
    body: "Motion is exponential ease-out from a visible default. The only entrance is the band setting down; everything else is a 120 to 220ms response to input. Reduced motion turns it all off.",
  },
];

export const surfaces = [
  {
    slug: "site",
    name: "Personal site and portfolio",
    mode: "Experience / Persuade",
    ink: "oxide",
    guidance: [
      "Open on a band with one word, then let the work lead: large plates of real images, captioned.",
      "Use a different section ink per project page so the site reads as a set of sheets.",
      "Prose sits in .ds-prose at 66ch; images may break the measure across 8 to 12 columns.",
    ],
  },
  {
    slug: "tools",
    name: "Small tools and apps",
    mode: "Operate",
    ink: "teal",
    guidance: [
      "Masthead plus content. Skip the band, or keep it short with no summary, so the task is above the fold.",
      "One primary button per view. Fields stack in a single column at most 32rem wide.",
      "Every list has an empty state that says what to do next, set in the serif.",
    ],
  },
  {
    slug: "dashboards",
    name: "Dashboards and data",
    mode: "Operate",
    ink: "grass",
    guidance: [
      "A row of three to five stats, each with a period, then tables and charts on the grid.",
      "Charts use the section inks as the categorical palette in their listed order: oxide, chrome, grass, teal, ultramarine, violet, sienna. Chrome needs a 1px ink edge on paper.",
      "Numbers are tabular (.ds-num). Right-align numeric columns.",
    ],
  },
  {
    slug: "docs",
    name: "Docs and writing",
    mode: "Read",
    ink: "ultramarine",
    guidance: [
      "Band for the section, then a three-part split: index or specimen, reading column, and on-this-page.",
      "Headings in the grotesk, body in Source Serif 4 at 17px / 1.6, 66ch measure.",
      "Code in .ds-code on the sunken field; asides in .ds-callout.",
    ],
  },
  {
    slug: "slides",
    name: "Slides",
    mode: "Persuade",
    ink: "violet",
    guidance: [
      "Start from the deck template (/deck, or the get_template MCP tool): a .ds-deck of .ds-slide sections, each with a data-layout: title, section, statement, list, split, stats, quote, code, image or end. Load ds.css, deck.css and deck.js.",
      "One ink for the whole talk. Title, section and end slides are inked; content slides are paper.",
      "One title and one short paragraph per slide. A slide that needs more is two slides.",
      "Footer carries the talk name and <span data-slide-number> in mono. Speaker notes go in <aside class=\"ds-slide__notes\">.",
      "Present with P, speaker view with S, export a PDF from the browser's print dialog (one 16:9 page per slide).",
    ],
  },
];

export function findSurface(query) {
  const q = String(query ?? "").trim().toLowerCase();
  return surfaces.find((s) => s.slug === q || s.name.toLowerCase().includes(q)) ?? null;
}
