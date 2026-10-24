---
name: Magnus Design System
description: A Swiss type specimen printed with one ink per section, served to people and agents alike.
colors:
  paper: "#fbfbfa"
  paper-sunken: "#f0f0ed"
  paper-raised: "#ffffff"
  ink: "#0b0b0c"
  ink-muted: "#4a4a4f"
  ink-faint: "#6b6b70"
  ink-inverse: "#fbfbfa"
  rule-strong: "#0b0b0c"
  rule-soft: "#dcdcd7"
  section-oxide: "#d1612f"
  section-chrome: "#e3b72b"
  section-grass: "#5f9a4a"
  section-teal: "#2f7f7a"
  section-ultramarine: "#2c3f9e"
  section-violet: "#6e4aa0"
  section-sienna: "#8a5a3b"
  signal-error: "#b42318"
  signal-success: "#3d6e2c"
  signal-warning: "#7a5a00"
  signal-focus: "#2c3f9e"
typography:
  monument:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(4.5rem, 15vw, 13rem)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.04em"
  display:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3rem, 7vw, 6rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\", \"lnum\""
  headline:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3.25rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.625rem, 2.4vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  ui:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.35
  small:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Familjen Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.06em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0"
  round: "999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "3rem"
  "8": "4rem"
  "9": "6rem"
  "10": "10rem"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-hover:
    backgroundColor: "{colors.paper-sunken}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-inverse}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-muted}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0 0.75rem"
  button-small:
    typography: "{typography.small}"
    padding: "0 0.75rem"
    height: "2rem"
  button-large:
    typography: "{typography.lead}"
    padding: "0 2rem"
    height: "3.5rem"
  input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.75rem"
    height: "2.75rem"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 0.5rem"
    height: "1.5rem"
  tag-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-inverse}"
  band:
    backgroundColor: "{colors.section-ultramarine}"
    textColor: "{colors.ink-inverse}"
    typography: "{typography.monument}"
    padding: "3rem clamp(1rem, 3vw, 2.5rem) 2rem"
  callout:
    backgroundColor: "{colors.paper-sunken}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "1rem 1.5rem 1.5rem"
    width: "66ch"
  code-block:
    backgroundColor: "{colors.paper-sunken}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    padding: "1rem"
  plate:
    backgroundColor: "{colors.paper-raised}"
    padding: "3rem 1.5rem"
---

# Design System: Magnus Design System

## Overview

**Creative North Star: "The Specimen Sheet, One Ink Per Section"**

Every surface is a sheet from a Swiss type specimen: near-white paper, black ink, a strict 12-column grid, 1px hairlines and square corners. Colour arrives only as a section ink, and when it arrives it fills a whole field: the opener band, a slide, a category tag, a chart series. A page announces itself with one monumental grotesk word set into that field, and everything beneath it drops to reading and interface sizes so the hierarchy is never in doubt.

Two voices divide the work. Familjen Grotesk carries structure (display, headings, navigation, labels, controls, numbers); Source Serif 4 carries reading; JetBrains Mono carries values and code and nothing else. Density is calm in reading and tight in operation: groups are close, sections are far apart. State is drawn in form, by rule weight, fill and dashed strokes, so every screen still reads in greyscale.

The system explicitly refuses the default docs look: a sidebar tree, Inter, a blue accent and rounded preview cards. It is flat, square and ruled; depth is a sunken field or an inset rule, never a lifted card.

**Key Characteristics:**
- Near-white paper and black ink; seven section inks laid as full fields, never as accents.
- One monumental word per page, in the band, and no other oversized type.
- Square corners everywhere except true circles and the radio dot.
- Hairlines divide, the 2px rule opens and selects, the 4px rule carries the section ink under the masthead.
- State reads without colour: dashed for disabled, the 2px rule for current and selected, a heavier border plus a sentence for errors.
- One authored motion moment (the band setting in); everything else is a 120 to 220ms response.

## Colors

A monochrome specimen sheet with seven saturated printer's inks held in reserve, one per section, plus a small set of signals kept apart from them.

### Primary
- **Specimen Black** (ink): primary text, every strong rule, filled controls (primary button, checked switch, solid tag) and text selection. It is the system's real primary; the section inks are fields, not brand accents.

### Secondary
The section inks, in their canonical order. Each one fills a section's opener band, an inked slide, a category tag, or a chart series. The same order is the categorical data palette.
- **Oxide** (section-oxide): warm red-orange field. Text on it is Specimen Black.
- **Chrome Yellow** (section-chrome): text on it is Specimen Black. On paper it needs a 1px ink edge (charts draw it).
- **Grass** (section-grass): text on it is Specimen Black.
- **Teal** (section-teal): text on it is Specimen Paper.
- **Ultramarine** (section-ultramarine): text on it is Specimen Paper.
- **Violet** (section-violet): text on it is Specimen Paper.
- **Sienna** (section-sienna): text on it is Specimen Paper.

Section inks keep the same value in light and dark themes; their paired "on" colour is fixed per ink.

### Tertiary
Signals. Always paired with a word or a drawn mark.
- **Vermilion Error** (signal-error): error borders, the "Error:" sentence, the error callout title. Held out of the section inks so it only ever means error.
- **Moss Success** (signal-success): success callout titles.
- **Ochre Warning** (signal-warning): warning callout titles (the callout rule also turns dashed).
- **Focus Ultramarine** (signal-focus): the 2px focus outline, offset 2px.

### Neutral
- **Specimen Paper** (paper): the page ground; also text on dark inks and on filled controls (ink-inverse).
- **Sunken Paper** (paper-sunken): wells, code blocks, callouts, and the hover fill on default buttons and table rows.
- **Raised White** (paper-raised): inputs, checkboxes, switches and plates, anything sitting on the ground.
- **Muted Ink** (ink-muted): secondary text, inactive nav and tabs, table heads, captions on plates. 8.5:1 on paper.
- **Faint Ink** (ink-faint): placeholders, metadata, disabled text and dashed disabled strokes. 5.1:1 on paper.
- **Soft Rule** (rule-soft): hairlines between rows, plate frames, code heads, the tab list baseline.

Dark theme swaps paper and ink (paper #111112, sunken #1a1a1c, raised #202023, ink #f2f2ef, muted #b4b4b0, faint #8e8e8a, soft rule #323235) and lifts the signals; it applies by OS preference unless `data-theme` overrides it.

### Named Rules
**The Full Field Rule.** A section ink is laid as a field (band, slide, tag fill, chart series, data bar), never as text colour, link colour, border accent or sprinkled highlight. One ink per section or project.

**The Greyscale Test Rule.** Every state must read with colour removed. Colour may reinforce a state; it never carries it alone.

## Typography

**Display Font:** Familjen Grotesk (with Helvetica Neue, Arial, sans-serif)
**Body Font:** Source Serif 4 (with Georgia, serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Menlo, monospace)

**Character:** A tight, slightly idiosyncratic grotesk does all the structural talking, set large and tracked in; a sturdy text serif does all the reading. The two never swap roles.

### Hierarchy
- **Monument** (700, clamp(4.5rem, 15vw, 13rem), 0.86, -0.04em): the single section word in the band. One word, never a sentence.
- **Display** (500, clamp(3rem, 7vw, 6rem), 1): stat values, with tabular lining numerals.
- **Headline** (500, clamp(2.25rem, 4vw, 3.25rem), 1.1, -0.02em): page-level h1 outside the band.
- **Title** (500, clamp(1.625rem, 2.4vw, 2rem), 1.1): h2, the sheet heading that sits under the 2px rule.
- **Subtitle** (500, 1.25rem, 1.1): h3 and the large button size.
- **Lead** (Source Serif 4, 1.25rem): intro paragraph and blockquotes; the band summary uses the same size in the grotesk at 1.35.
- **Body** (Source Serif 4, 400, 1.0625rem / 17px, 1.6): running text, capped at 66ch, with hanging punctuation and pretty wrapping.
- **UI** (400, 0.9375rem, 1.35): controls, navigation, table cells, field labels (500).
- **Small** (0.8125rem): help text, captions, metadata, code heads.
- **Label** (500, 0.75rem, +0.06em, uppercase): table column heads, tags, list headings such as "On this page".
- **Mono** (JetBrains Mono, 0.8125rem in code blocks, 0.875em inline): code, token values, measurements, stat deltas, slide footers.

### Named Rules
**The One Word Rule.** Monument size is used once per page, for one word in the band. Nothing else on the page is set larger than a title.

**The Two Voices Rule.** Grotesk for structure, serif for reading, mono for values. Mono is never decoration and never running text.

## Layout

A 12-column sheet: 1.25rem gutters, margins of clamp(1rem, 3vw, 2.5rem), a 90rem maximum width. Spacing is a 4px-based scale (0.25rem to 10rem); tight inside groups (0.5 to 1rem), generous between them (6rem between sheets, 10rem below the page).

Every page follows the same order: masthead, then a full-bleed band in the section ink (min-height clamp(16rem, 36vw, 26rem), content aligned to its bottom), then the content split. From 64rem the band word starts at column 3 and runs to 12, the summary spans columns 3 to 8 at 40ch, and mono metadata sits right-aligned in columns 9 to 12. Below 40rem the band stacks to full width.

Reading pages use a 3/7/2 split: index or specimen in columns 1 to 3, the reading column in 4 to 10 (prose still capped at 66ch inside it), "on this page" in 11 to 12. Side columns are sticky. Below 72rem the right column drops and the reading column widens to 4 to 12; below 52rem everything stacks to one column.

Each content sheet opens on a 2px strong rule with its heading directly beneath.

Breakpoints observed: 40rem (masthead wraps, nav becomes a scrolling row with a faded trailing edge; band stacks), 64rem (band word moves to column 3).

### Named Rules
**The Sheet Rule.** Content regions open on the 2px strong rule, not inside a box. Separation comes from the rule and the space, never from a card.

## Elevation & Depth

Flat. There are no elevation shadows anywhere. Depth is tonal and drawn: wells and asides sit on sunken paper, inputs and plates sit on raised white, and the box-shadow property is used only as an inset rule (the 1px underline under inputs that thickens to 2px on hover and focus, and the 2px top and bottom rules on a selected table row). The masthead is sticky on the docs site but casts nothing; it ends on its ink rule.

### Shadow Vocabulary
- **Input baseline** (`box-shadow: inset 0 -1px 0 var(--ds-ink)`): resting underline inside every input, select and textarea.
- **Input baseline, active** (`box-shadow: inset 0 -2px 0 var(--ds-ink)`): hover and focus-visible on fields.
- **Selected row** (`box-shadow: inset 0 -2px 0 var(--ds-ink), inset 0 2px 0 var(--ds-ink)`): a selected table row, ruled instead of tinted.

### Named Rules
**The Inset-Only Rule.** A shadow is allowed only as an inset line that draws a rule. Anything that lifts a surface off the page is out.

## Shapes

Square. Radius is 0 on every control, field, tag, plate, code block, band and slide. The only round forms are true circles: radio inputs and their dot (999px). Lines come in a fixed set of weights: the 1px hairline divides, the 1.5px stroke outlines interactive controls (buttons, checkboxes, radios, the switch track), the 2px rule opens a section and marks current or selected, and a 4px rule carries the section ink under the masthead and marks the error callout. Disabled controls switch their stroke to dashed. Drawn marks are geometry, not glyphs: the select chevron is two gradients, the arrow link uses a masked SVG stroke, the stat trend is a clipped triangle.

## Components

### Buttons
Outlined, square and plain; one filled button per view.
- **Shape:** square corners (0), a 1.5px ink outline, 2.75rem tall.
- **Default:** transparent with ink text, 1.5rem side padding, UI size at 500.
- **Primary:** filled ink with paper text; hover steps the fill and border to muted ink.
- **Hover / Focus:** default buttons fill with sunken paper on hover; press nudges down 1px; focus is the global 2px ultramarine outline. Transitions run at 120ms on exponential ease-out.
- **Ghost:** no visible border, underlined text that thickens to 2px on hover, 0.75rem side padding.
- **Sizes:** small (2rem, small text) and large (3.5rem, lead text).
- **Disabled:** faint ink with a dashed faint stroke. **Busy:** a 2px bar after the label that scales in and out.

### Links
Underlined ink, 1px under normal use, 2px on hover, offset 0.22em. They never rely on colour. The arrow variant adds a drawn arrow that moves 2px forward on hover.

### Tags
- **Style:** label type (0.75rem, uppercase, +0.06em) in a 1.5rem-tall square frame drawn with a 1px currentColor hairline.
- **Variants:** outlined (status, always with a word), solid ink, or filled with a section ink for categories.

### Callouts
An aside in reading: sunken paper, a 2px ink rule on top, a bold grotesk title and a serif body, capped at 66ch. The tone changes the rule's form as well as its colour: warning dashes the rule, error raises it to 4px in vermilion, success only colours the title.

### Inputs / Fields
- **Style:** raised white, 1px ink border, square, 2.75rem tall, with an inset ink baseline.
- **Focus:** the baseline thickens to 2px and the ultramarine focus outline sits flush (offset 0).
- **Error:** the border becomes 2px vermilion and an error sentence beneath it starts with the word "Error:". **Disabled:** dashed border, faint text, transparent ground.
- **Field group:** label (UI, 500), control, help (small, muted), error, stacked with 0.5rem gaps, max 32rem wide.
- **Checkbox / radio:** a 1.125rem square (radio round) with a 1.5px ink stroke; checked scales in a solid ink mark. **Switch:** a square 2.5rem track that fills with ink when on, its square thumb sliding over and flipping to paper.

### Navigation
- **Masthead:** a 3.75rem bar on paper. Bold wordmark on the left, section nav right after it, one utility on the far right. Nav items are UI-size muted ink; hover goes to full ink; the current page gets a 2px ink underline. With a section ink, the masthead closes on a 4px rule in that ink, so the section stays legible once the band scrolls away.
- **Mobile:** the nav wraps to its own full-width row that scrolls horizontally, its trailing edge faded.
- **Tabs:** muted UI-size labels on a soft hairline; the selected tab turns full ink, 500 weight, with the 2px rule.

### Tables
Heavy 2px rule under the head, uppercase muted label heads, 1px soft hairlines between rows, tabular numerals, no vertical rules and no zebra stripes. The first and last columns sit flush to the edges. Hovered rows fill with sunken paper; selected rows get ink rules above and below.

### Band (signature)
The section opener: a full-bleed field in the section ink holding one monumental word, an optional one-line summary and mono metadata. With `data-animate`, the field wipes down over 640ms and the word lands 80ms later, rising from a slight blur. It is the only entrance animation the system has, and reduced motion turns it off.

### Stats, Code, Plates, Slides
- **Stat:** a hairline on top, a small muted label, a display-size figure with a lighter unit, and a mono delta led by a drawn triangle.
- **Code block:** sunken paper under a strong hairline, a small muted filename head over a soft rule, mono at 0.8125rem / 1.6.
- **Plate:** a framed specimen with a soft hairline on raised white, a centred stage padded 3rem by 1.5rem, and a small muted caption bar.
- **Slide:** 16:9, container-scaled. Paper slides for content, inked slides for openers, with a 9cqi bold title, a serif paragraph and a mono footer.

## Do's and Don'ts

### Do:
- **Do** give each section or project one section ink and lay it as a full field (band, slide, tag fill, chart series).
- **Do** use the section inks in their listed order as the categorical data palette: oxide, chrome, grass, teal, ultramarine, violet, sienna, and give chrome a 1px ink edge on paper.
- **Do** open every page with one band holding one word at monument size, directly under the masthead.
- **Do** keep running text in Source Serif 4 at 17px / 1.6 with a 66ch measure.
- **Do** draw state in form: dashed strokes for disabled, the 2px rule for current and selected, a 2px vermilion border plus an "Error:" sentence for errors.
- **Do** keep motion to 120ms for hover and press, 220ms for toggles and tabs, on exponential ease-out (cubic-bezier(0.16, 1, 0.3, 1)).

### Don't:
- **Don't** round corners on anything but true circles and radio dots.
- **Don't** lift surfaces with drop shadows; use sunken paper or an inset rule.
- **Don't** use a section ink as text colour, link colour or an accent sprinkled across a page.
- **Don't** let colour carry a state on its own, including coloured links without an underline.
- **Don't** set more than one band per page, or put sentences or controls in the band.
- **Don't** box content in nested cards; use a plate, a sunken field, or a sheet opened by the rule.
- **Don't** use vermilion for anything but errors.
- **Don't** ship the default docs look: a sidebar tree, Inter, a blue accent and rounded preview cards.
