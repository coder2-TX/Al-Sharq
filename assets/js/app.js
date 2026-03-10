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

    // Clean common bad encodings: BOM + NULLs (UTF-16 saved by mistake)
    const html = (htmlRaw || "")
      .replace(/^\uFEFF/, "")
      .replace(/\u0000/g, "")
      .trim();

    if (!html) {
      throw new Error(`Partial is EMPTY: ${url}`);
    }

    // Strict check فقط للهيرو: لو ما فيه المحتوى نوقف ونوضح السبب
    if (
      url.endsWith("partials/hero.html") &&
      !html.includes("lp-hero__content")
    ) {
      // اطبع جزء من الاستجابة لتعرف ايش فعلاً انجاب
      const preview = html
        .slice(0, 250)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      el.innerHTML = `<div style="padding:12px;border:2px solid #f00;background:#fff;color:#000;font:14px/1.6 Arial">
          <b>ERROR:</b> hero.html loaded but missing <code>lp-hero__content</code><br>
          <b>URL:</b> ${url}<br>
          <b>Preview:</b><pre style="white-space:pre-wrap;margin:8px 0 0">${preview}</pre>
        </div>`;
      throw new Error(
        `hero.html missing lp-hero__content -> wrong file or not saved UTF-8: ${url}`,
      );
    }

    // Parse safely
    const tpl = document.createElement("template");
    tpl.innerHTML = html;

    // Insert parsed nodes then remove slot
    el.parentNode.insertBefore(tpl.content, el);

    const afterName = el.getAttribute("data-after");
    el.remove();

    //  تنفيذ الدالة بعد إضافة المحتوى
    if (afterName && typeof window[afterName] === "function") {
      window[afterName]();
    }

    //  تهيئة الخطوط لجميع الأقسام التي تم تحميلها
    initAllLinesAfterLoad();
  };

  //  دالة جديدة لتهيئة جميع الخطوط في الأقسام المختلفة
  const initAllLinesAfterLoad = () => {
    if (typeof window.lpInitHeroLines !== "function") return;

    // تهيئة الخطوط في الهيرو إذا كان موجوداً
    const heroSection = document.querySelector(".lp-hero");
    if (heroSection) {
      window.lpInitHeroLines(heroSection);
    }

    // تهيئة الخطوط في قسم تواصل معنا إذا كان موجوداً
    const contactSection = document.getElementById("contact-intro");
    if (contactSection) {
      window.lpInitHeroLines(contactSection);
    }

    // تهيئة الخطوط في الفوتر إذا كان موجوداً
    const footer = document.querySelector(".lp-footer");
    if (footer) {
      window.lpInitHeroLines(footer);
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

    //  تهيئة أولية بعد تحميل كل الـ partials
    setTimeout(() => {
      initAllLinesAfterLoad();
    }, 100);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  //  مراقبة إضافة أي partials جديدة بعد التحميل الأول
  const observer = new MutationObserver((mutations) => {
    let needsInit = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // تحقق إذا تم إضافة partial جديد
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            if (
              node.classList?.contains("lp-hero") ||
              node.id === "contact-intro" ||
              node.classList?.contains("lp-footer")
            ) {
              needsInit = true;
            }
          }
        });
      }
    });

    if (needsInit && typeof window.lpInitHeroLines === "function") {
      setTimeout(() => {
        initAllLinesAfterLoad();
      }, 50);
    }
  });

  // بدء المراقبة بعد تحميل الصفحة
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  } else {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
})();
