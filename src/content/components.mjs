// The component catalogue. One source for the docs page and the MCP tools.
// `markup` is the canonical HTML: copy it as-is with ds.css loaded.

export const components = [
  {
    slug: "masthead",
    name: "Masthead",
    summary: "The top bar: wordmark, section navigation, one utility on the right.",
    use: ["Every page that has more than one section.", "Mark the current section with aria-current=\"page\"; it gets the 2px rule."],
    avoid: ["More than seven nav items. Group them or move them to a page.", "Icons in place of section names."],
    states: ["rest", "hover", "current (aria-current)", "focus"],
    surfaces: ["site", "tools", "dashboards", "docs"],
    markup: `<header class="ds-masthead">
  <div class="ds-masthead__inner">
    <a class="ds-masthead__mark" href="/">Magnus</a>
    <nav class="ds-masthead__nav" aria-label="Sections">
      <a href="/work" aria-current="page">Work</a>
      <a href="/notes">Notes</a>
      <a href="/about">About</a>
    </nav>
  </div>
</header>`,
  },
  {
    slug: "band",
    name: "Band",
    summary: "The section opener: a full-width field of the section ink holding one monumental word.",
    use: ["Once per page, directly under the masthead.", "One word. If it needs two, the section name is too long.", "Set data-ink on the band (or any ancestor) to choose the field colour.", "Add data-animate for the one entrance moment the system allows."],
    avoid: ["Sentences or headlines in the band word.", "More than one band per page.", "Putting controls in the band."],
    states: ["static", "animated entrance (data-animate, respects reduced motion)"],
    surfaces: ["site", "docs", "slides"],
    markup: `<section class="ds-band" data-ink="ultramarine" data-animate>
  <div class="ds-band__inner">
    <h1 class="ds-band__word">Notes</h1>
    <p class="ds-band__summary">Short writing on tools, type and building things for myself.</p>
    <p class="ds-band__meta">14 entries · 2026</p>
  </div>
</section>`,
  },
  {
    slug: "button",
    name: "Button",
    summary: "Triggers an action. Square, outlined by default; one filled primary per view.",
    use: ["data-variant=\"primary\" for the single main action in a view.", "Default (outlined) for secondary actions.", "data-variant=\"ghost\" for low-weight actions inside dense UI.", "Name the action: \"Save note\", not \"OK\"."],
    avoid: ["Two primary buttons side by side.", "Rounded corners, gradients or shadows.", "Using a button for navigation: use a link."],
    states: ["rest", "hover", "active (1px press)", "focus", "disabled (dashed border, faint ink)", "busy (aria-busy, animated rule)"],
    surfaces: ["site", "tools", "dashboards", "docs"],
    markup: `<button class="ds-button" data-variant="primary" type="button">Save note</button>
<button class="ds-button" type="button">Cancel</button>
<button class="ds-button" data-variant="ghost" type="button">Discard</button>
<button class="ds-button" type="button" disabled>Archived</button>
<button class="ds-button" data-variant="primary" type="button" aria-busy="true">Saving</button>`,
  },
  {
    slug: "link",
    name: "Link",
    summary: "Underlined ink, thickening on hover. Links never rely on colour.",
    use: ["Inline in prose, or standalone with data-arrow for a way forward."],
    avoid: ["Removing the underline in running text.", "Coloured links: the underline is the signal."],
    states: ["rest", "hover (2px underline)", "focus", "visited (inherits)"],
    surfaces: ["site", "tools", "dashboards", "docs"],
    markup: `<a class="ds-link" href="/notes">Read the notes</a>
<a class="ds-link" href="/work" data-arrow>All work</a>`,
  },
  {
    slug: "field",
    name: "Field",
    summary: "Label, control, help text and error, stacked. Wraps input, select or textarea.",
    use: ["Always a visible label. Placeholder is an example, never the label.", "Set data-invalid on the field and add a .ds-field__error; link it with aria-describedby.", "Errors say what is wrong and how to fix it."],
    avoid: ["Floating labels.", "Red borders without an error message."],
    states: ["rest", "hover (2px base rule)", "focus", "disabled (dashed)", "invalid (2px error border + message)"],
    surfaces: ["tools", "dashboards", "site"],
    markup: `<div class="ds-field">
  <label class="ds-field__label" for="title">Title</label>
  <input class="ds-input" id="title" placeholder="e.g. Notes on grids" aria-describedby="title-help">
  <p class="ds-field__help" id="title-help">Shown in the list and the page title.</p>
</div>
<div class="ds-field" data-invalid>
  <label class="ds-field__label" for="slug">Slug</label>
  <input class="ds-input" id="slug" value="Notes on grids" aria-invalid="true" aria-describedby="slug-error">
  <p class="ds-field__error" id="slug-error">Use lowercase letters and hyphens, like notes-on-grids.</p>
</div>`,
  },
  {
    slug: "select",
    name: "Select",
    summary: "Native select with the system's square frame and a drawn chevron.",
    use: ["Five to fifteen options. Fewer: radios. More: a search field."],
    avoid: ["Custom dropdown widgets when the native one does the job."],
    states: ["rest", "hover", "focus", "disabled", "invalid (via .ds-field[data-invalid])"],
    surfaces: ["tools", "dashboards"],
    markup: `<div class="ds-field">
  <label class="ds-field__label" for="range">Range</label>
  <select class="ds-select" id="range">
    <option>Last 7 days</option>
    <option selected>Last 30 days</option>
    <option>This year</option>
  </select>
</div>`,
  },
  {
    slug: "check",
    name: "Checkbox and radio",
    summary: "Square box, round radio, filled ink mark when checked.",
    use: ["Checkbox for independent options; radio for one of a few."],
    avoid: ["A single checkbox for an instant setting: use a switch."],
    states: ["unchecked", "checked", "focus", "disabled (dashed)"],
    surfaces: ["tools", "dashboards", "site"],
    markup: `<label class="ds-check"><input type="checkbox" checked> Show drafts</label>
<label class="ds-check"><input type="checkbox"> Show archived</label>
<label class="ds-check"><input type="radio" name="sort" checked> Newest first</label>
<label class="ds-check"><input type="radio" name="sort"> Oldest first</label>`,
  },
  {
    slug: "switch",
    name: "Switch",
    summary: "An instant on/off setting. The track fills with ink when on.",
    use: ["Settings that apply immediately with no save step."],
    avoid: ["Inside forms that have a submit button: use a checkbox."],
    states: ["off", "on (filled track)", "focus", "disabled"],
    surfaces: ["tools", "dashboards"],
    markup: `<label class="ds-switch"><input type="checkbox" role="switch" checked> Dark mode</label>`,
  },
  {
    slug: "tag",
    name: "Tag",
    summary: "A small uppercase label for status or category. Outlined, solid, or filled with a section ink.",
    use: ["Categories: data-ink with a section ink.", "Status: outlined, with a word that names the status."],
    avoid: ["Tags as buttons.", "More than three on one item."],
    states: ["outlined", "solid", "inked"],
    surfaces: ["site", "tools", "dashboards", "docs"],
    markup: `<span class="ds-tag">Draft</span>
<span class="ds-tag" data-variant="solid">Live</span>
<span class="ds-tag" data-ink="grass">Garden</span>
<span class="ds-tag" data-ink="ultramarine">Code</span>`,
  },
  {
    slug: "callout",
    name: "Callout",
    summary: "An aside in reading. A top rule and a sunken field; the tone changes the rule, not just the colour.",
    use: ["Notes, warnings and errors next to running text.", "data-tone: note (default), warning (dashed rule), error (heavy rule), success."],
    avoid: ["Stacking callouts.", "Side stripes. The rule sits on top."],
    states: ["note", "warning", "error", "success"],
    surfaces: ["docs", "tools", "site"],
    markup: `<aside class="ds-callout">
  <p class="ds-callout__title">Note</p>
  <p class="ds-callout__body">Tokens are generated from tokens.json. Edit that file, not the CSS.</p>
</aside>
<aside class="ds-callout" data-tone="error" role="alert">
  <p class="ds-callout__title">Sync failed</p>
  <p class="ds-callout__body">The feed returned 404. Check the URL in Settings and try again.</p>
</aside>`,
  },
  {
    slug: "table",
    name: "Table",
    summary: "Data in rows. Heavy rule under the head, hairlines between rows, tabular numerals.",
    use: ["Right-align numbers with data-align=\"end\".", "Wrap in .ds-table-wrap so it scrolls instead of breaking the page.", "Mark a selected row with aria-selected=\"true\"; it gets ink rules, not a tint."],
    avoid: ["Zebra stripes.", "Vertical rules between columns."],
    states: ["rest", "row hover", "row selected", "empty (.ds-table__empty)"],
    surfaces: ["dashboards", "tools", "docs"],
    markup: `<div class="ds-table-wrap">
  <table class="ds-table">
    <thead><tr><th>Project</th><th>Status</th><th data-align="end">Visits</th></tr></thead>
    <tbody>
      <tr><td>Site</td><td><span class="ds-tag" data-variant="solid">Live</span></td><td data-align="end">1,204</td></tr>
      <tr aria-selected="true"><td>Reading list</td><td><span class="ds-tag">Draft</span></td><td data-align="end">88</td></tr>
      <tr><td>Plant log</td><td><span class="ds-tag">Paused</span></td><td data-align="end">0</td></tr>
    </tbody>
  </table>
</div>`,
  },
  {
    slug: "stat",
    name: "Stat",
    summary: "One figure with its label, unit and change. For dashboards, in a row of three to five.",
    use: ["Say what changed and over what period.", "Pair the trend mark with the number; colour is optional."],
    avoid: ["A single giant stat as a page hero.", "Stats without a time frame."],
    states: ["neutral", "trend up", "trend down"],
    surfaces: ["dashboards", "slides"],
    markup: `<div class="ds-stat">
  <span class="ds-stat__label">Reading this month</span>
  <span class="ds-stat__value">412<span class="ds-stat__unit">pages</span></span>
  <span class="ds-stat__delta" data-trend="up">+18% vs September</span>
</div>`,
  },
  {
    slug: "code",
    name: "Code block",
    summary: "Monospace on the sunken field with a filename head and a copy action.",
    use: ["Any code, config or command the reader will copy."],
    avoid: ["Dark code blocks on the light theme.", "Syntax colours from outside the palette."],
    states: ["rest", "copied (button label changes to Copied)"],
    surfaces: ["docs", "site"],
    markup: `<figure class="ds-code">
  <figcaption class="ds-code__head"><span>index.html</span><button class="ds-button" data-variant="ghost" data-size="small" type="button">Copy</button></figcaption>
  <pre><code>&lt;link rel="stylesheet" href="https://ds.example.dev/ds.css"&gt;</code></pre>
</figure>`,
  },
  {
    slug: "tabs",
    name: "Tabs",
    summary: "Switch between views of the same thing. The selected tab gets the 2px rule.",
    use: ["Two to five peer views, such as Preview and Code.", "Use role=tablist/tab/tabpanel and arrow-key navigation."],
    avoid: ["Tabs as page navigation: use the masthead."],
    states: ["rest", "hover", "selected", "focus"],
    surfaces: ["tools", "dashboards", "docs"],
    markup: `<div class="ds-tabs">
  <div class="ds-tabs__list" role="tablist" aria-label="View">
    <button class="ds-tabs__tab" role="tab" aria-selected="true" aria-controls="p1" id="t1">Preview</button>
    <button class="ds-tabs__tab" role="tab" aria-selected="false" aria-controls="p2" id="t2" tabindex="-1">Code</button>
  </div>
  <div class="ds-tabs__panel" role="tabpanel" id="p1" aria-labelledby="t1">Preview panel</div>
  <div class="ds-tabs__panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden>Code panel</div>
</div>`,
  },
  {
    slug: "plate",
    name: "Plate",
    summary: "A framed specimen: a stage that shows something rendered, captioned underneath.",
    use: ["Showing a component, an image or a chart with a caption.", "The caption names what it is and where it comes from."],
    avoid: ["Plates as general-purpose cards or page structure.", "Nesting plates."],
    states: ["static"],
    surfaces: ["docs", "site"],
    markup: `<figure class="ds-plate">
  <div class="ds-plate__stage"><button class="ds-button" data-variant="primary" type="button">Save note</button></div>
  <figcaption class="ds-plate__caption"><span>Button, primary</span><span>ds.css</span></figcaption>
</figure>`,
  },
  {
    slug: "slide",
    name: "Slide",
    summary: "A 16:9 sheet that scales with its container. Paper by default, or a full section-ink field.",
    use: ["Talks and walkthroughs: one idea per slide.", "Inked slides for section openers; paper slides for content."],
    avoid: ["More than one title and one paragraph per slide.", "Bullet lists longer than four items."],
    states: ["paper", "inked (data-ink)"],
    surfaces: ["slides"],
    markup: `<section class="ds-slide" data-ink="oxide">
  <header class="ds-slide__head"><span>Building for one</span><span>Part II</span></header>
  <div class="ds-slide__body">
    <h2 class="ds-slide__title">Tokens</h2>
    <p class="ds-slide__text">One JSON file feeds the CSS, the docs and the agents.</p>
  </div>
  <footer class="ds-slide__foot"><span>Magnus</span><span>07 / 24</span></footer>
</section>`,
  },
];

export function findComponent(query) {
  const q = String(query ?? "").trim().toLowerCase();
  return components.find((c) => c.slug === q || c.name.toLowerCase() === q) ?? null;
}
