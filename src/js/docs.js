// Docs behaviour: theme, copy, tabs, motion demo, origin-aware snippets.

const root = document.documentElement;

// Theme: explicit choice wins over the OS preference; stored per browser.
const toggle = document.querySelector(".theme-toggle");
const isDark = () =>
  root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
const syncToggle = () => {
  if (!toggle) return;
  toggle.textContent = isDark() ? "Light" : "Dark";
  toggle.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
};
toggle?.addEventListener("click", () => {
  root.dataset.theme = isDark() ? "light" : "dark";
  try { localStorage.setItem("ds-theme", root.dataset.theme); } catch {}
  syncToggle();
});
syncToggle();

// Copy: any [data-copy] element copies its value; the target shows it by form.
async function copy(text, el, label) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }
  el.setAttribute("data-copied", "");
  const before = label?.textContent;
  if (label) label.textContent = "Copied";
  setTimeout(() => {
    el.removeAttribute("data-copied");
    if (label) label.textContent = before;
  }, 1400);
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-copy]");
  if (!el) return;
  const value = el.dataset.copy || el.closest(".ds-code")?.querySelector("pre")?.innerText || "";
  copy(value, el, el.matches("button:not(.swatch)") ? el : null);
});

// Tabs: click and arrow keys.
for (const list of document.querySelectorAll('[role="tablist"]')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    }
    tab.focus();
  };
  list.addEventListener("click", (e) => {
    const t = e.target.closest('[role="tab"]');
    if (t) select(t);
  });
  list.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) { e.preventDefault(); select(tabs[(i + step + tabs.length) % tabs.length]); }
    if (e.key === "Home") { e.preventDefault(); select(tabs[0]); }
    if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1]); }
  });
}

// Motion demo.
document.querySelector("[data-motion-play]")?.addEventListener("click", () => {
  const demo = document.querySelector(".motion-demo");
  demo.toggleAttribute("data-on");
});

// Snippets that name this deployment's origin.
for (const el of document.querySelectorAll("[data-origin]")) {
  el.textContent = el.textContent.replaceAll("https://ds.example.dev", location.origin);
  const code = el.closest(".ds-code")?.querySelector("[data-copy]");
  if (code && code.dataset.copy) code.dataset.copy = code.dataset.copy.replaceAll("https://ds.example.dev", location.origin);
}
