// Decks: present a .ds-deck of .ds-slide sections.
// Keys: P present · arrows / space / PageUp/Down move · Home/End · F fullscreen
//       S speaker view · Esc back to the document. #n in the URL opens slide n.

const deck = document.querySelector(".ds-deck");
if (deck) init(deck);

function init(deck) {
  const slides = [...deck.querySelectorAll(":scope > .ds-slide")];
  const total = slides.length;
  const root = document.documentElement;
  let index = 0;
  let speaker = null;
  let startedAt = null;
  let timer = null;

  // Number every slide and fill [data-slide-number] placeholders.
  slides.forEach((s, i) => {
    s.id ||= `slide-${i + 1}`;
    s.setAttribute("aria-roledescription", "slide");
    s.setAttribute("aria-label", `${i + 1} of ${total}`);
    for (const el of s.querySelectorAll("[data-slide-number]")) {
      el.textContent = `${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }
  });

  const title = deck.dataset.title || document.title;
  const bar = document.createElement("div");
  bar.className = "ds-deck-bar";
  bar.innerHTML = `<span class="ds-deck-bar__title"></span>
    <span class="ds-deck-bar__keys">P present · S speaker · F fullscreen</span>
    <button class="ds-button" data-size="small" type="button" data-act="print">PDF</button>
    <button class="ds-button" data-size="small" type="button" data-act="speaker">Speaker view</button>
    <button class="ds-button" data-variant="primary" data-size="small" type="button" data-act="present">Present</button>`;
  bar.querySelector(".ds-deck-bar__title").textContent = title;
  deck.before(bar);
  bar.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "present") present(index);
    if (act === "speaker") openSpeaker();
    if (act === "print") window.print();
  });

  const presenting = () => root.classList.contains("ds-presenting");

  function go(i) {
    index = Math.max(0, Math.min(total - 1, i));
    slides.forEach((s, n) => s.setAttribute("aria-current", String(n === index)));
    history.replaceState(null, "", `#${index + 1}`);
    renderSpeaker();
  }

  function present(i = index) {
    root.classList.add("ds-presenting");
    go(i);
    startedAt ??= Date.now();
    startTimer();
  }

  function stop() {
    root.classList.remove("ds-presenting");
    if (document.fullscreenElement) document.exitFullscreen();
    slides[index].scrollIntoView({ block: "center" });
  }

  function onKey(e) {
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === "p" || k === "P") { e.preventDefault(); presenting() ? stop() : present(currentInView()); return; }
    if (k === "s" || k === "S") { e.preventDefault(); openSpeaker(); return; }
    if (k === "f" || k === "F") {
      e.preventDefault();
      if (!presenting()) present(currentInView());
      document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen?.();
      return;
    }
    if (!presenting() && !speaker) return;
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(k)) { e.preventDefault(); go(index + 1); }
    else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(k)) { e.preventDefault(); go(index - 1); }
    else if (k === "Home") { e.preventDefault(); go(0); }
    else if (k === "End") { e.preventDefault(); go(total - 1); }
    else if (k === "Escape" && presenting()) stop();
  }
  document.addEventListener("keydown", onKey);

  // Click or tap: right two thirds forward, left third back.
  deck.addEventListener("click", (e) => {
    if (!presenting() || e.target.closest("a, button")) return;
    go(e.clientX > innerWidth / 3 ? index + 1 : index - 1);
  });
  let touchX = null;
  deck.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener("touchend", (e) => {
    if (!presenting() || touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
    touchX = null;
  });

  // Double-click a slide in the document view to present from it.
  deck.addEventListener("dblclick", (e) => {
    const s = e.target.closest(".ds-slide");
    if (s && !presenting()) present(slides.indexOf(s));
  });

  function currentInView() {
    const mid = innerHeight / 2;
    let best = 0;
    let dist = Infinity;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  }

  // ---- Speaker view: a second window this script draws and keeps in sync. ----
  function openSpeaker() {
    if (speaker && !speaker.closed) { speaker.focus(); return; }
    speaker = window.open("", "ds-speaker", "width=1100,height=700");
    if (!speaker) return;
    const doc = speaker.document;
    doc.title = `Speaker · ${title}`;
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      const l = doc.createElement("link");
      l.rel = "stylesheet";
      l.href = link.href;
      doc.head.append(l);
    }
    doc.documentElement.dataset.theme = root.dataset.theme || "";
    doc.body.innerHTML = `<div class="ds-speaker">
      <div class="ds-speaker__bar"><span class="ds-speaker__count"></span><span class="ds-label">Next</span><span class="ds-speaker__nexttitle"></span><span class="ds-speaker__timer">00:00</span></div>
      <div class="ds-speaker__now"></div>
      <div class="ds-speaker__side"><div class="ds-speaker__next"></div><div class="ds-speaker__notes"></div></div>
    </div>`;
    doc.addEventListener("keydown", onKey);
    startedAt ??= Date.now();
    startTimer();
    renderSpeaker();
  }

  function renderSpeaker() {
    if (!speaker || speaker.closed) return;
    const doc = speaker.document;
    const clone = (s) => {
      if (!s) return doc.createTextNode("End of deck");
      const c = s.cloneNode(true);
      c.removeAttribute("id");
      c.querySelector(".ds-slide__notes")?.remove();
      return c;
    };
    const next = slides[index + 1];
    doc.querySelector(".ds-speaker__count").textContent = `${index + 1} / ${total}`;
    doc.querySelector(".ds-speaker__nexttitle").textContent = next?.querySelector(".ds-slide__title")?.textContent ?? "End";
    doc.querySelector(".ds-speaker__now").replaceChildren(clone(slides[index]));
    doc.querySelector(".ds-speaker__next").replaceChildren(clone(next));
    doc.querySelector(".ds-speaker__notes").textContent = slides[index].querySelector(".ds-slide__notes")?.textContent.trim() ?? "";
  }

  function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
      if (!speaker || speaker.closed) return;
      const s = Math.floor((Date.now() - startedAt) / 1000);
      speaker.document.querySelector(".ds-speaker__timer").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }, 1000);
  }

  const fromHash = parseInt(location.hash.slice(1), 10);
  go(Number.isFinite(fromHash) ? fromHash - 1 : 0);
  if (Number.isFinite(fromHash)) slides[index].scrollIntoView({ block: "center" });
}
