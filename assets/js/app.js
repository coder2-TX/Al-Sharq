(() => {
  "use strict";

  const loadOne = async (el) => {
    const url = el.getAttribute("data-partial");
    if (!url) return;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to load partial: ${url} (${res.status})`);
    }

const htmlRaw = await res.text();

//  Clean common bad encodings: BOM + NULLs (UTF-16 saved by mistake)
const html = (htmlRaw || "")
  .replace(/^\uFEFF/, "")
  .replace(/\u0000/g, "")
  .trim();

if (!html) {
  throw new Error(`Partial is EMPTY: ${url}`);
}

//  Strict check فقط للهيرو: لو ما فيه المحتوى نوقف ونوضح السبب
if (url.endsWith("partials/hero.html") && !html.includes('lp-hero__content')) {
  // اطبع جزء من الاستجابة لتعرف ايش فعلاً انجاب
  const preview = html.slice(0, 250).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  el.innerHTML =
    `<div style="padding:12px;border:2px solid #f00;background:#fff;color:#000;font:14px/1.6 Arial">
      <b>ERROR:</b> hero.html loaded but missing <code>lp-hero__content</code><br>
      <b>URL:</b> ${url}<br>
      <b>Preview:</b><pre style="white-space:pre-wrap;margin:8px 0 0">${preview}</pre>
    </div>`;
  throw new Error(`hero.html missing lp-hero__content -> wrong file or not saved UTF-8: ${url}`);
}

//  Parse safely
const tpl = document.createElement("template");
tpl.innerHTML = html;

//  Insert parsed nodes then remove slot
el.parentNode.insertBefore(tpl.content, el);

const afterName = el.getAttribute("data-after");
el.remove();

if (afterName && typeof window[afterName] === "function") {
  window[afterName]();
}

  };

  const boot = async () => {
    const nodes = Array.from(document.querySelectorAll("[data-partial]"));
    for (const el of nodes) {
      try {
        await loadOne(el);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
