// Fills a template's {{PLACEHOLDERS}}. BASE is the origin the deck loads the
// system from: "" for pages on this site, an absolute origin for a download.
export function fillTemplate(html, values) {
  return html.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => (key in values ? String(values[key]) : m));
}

// Inlines the stylesheets and script so the file works with no network at all,
// except for fonts, which stay on the system's origin.
export function inlineTemplate(html, { base, dsCSS, deckCSS, deckJS }) {
  const css = (dsCSS + "\n" + deckCSS).replace(/url\("fonts\//g, `url("${base}/fonts/`);
  return html
    .replace(/<link rel="stylesheet" href="[^"]*\/ds\.css">\n?/, "")
    .replace(/<link rel="stylesheet" href="[^"]*\/deck\.css">/, `<style>\n${css}\n</style>`)
    .replace(/<script type="module" src="[^"]*\/deck\.js"><\/script>/, `<script type="module">\n${deckJS}\n</script>`);
}
