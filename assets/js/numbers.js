(() => {
  "use strict";

  const animateCount = (el, target, durationMs = 2200) => {
    const start = performance.now();
    const from = 0;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const p = Math.min(1, (now - start) / durationMs);
      const v = Math.round(from + (target - from) * easeOutCubic(p));
      el.textContent = String(v);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  window.lpInitNumbers = () => {
    const section = document.querySelector(".lp-stats");
    if (!section) return;
    if (section.dataset.countupInit === "1") return;
    section.dataset.countupInit = "1";

    const nums = Array.from(section.querySelectorAll("[data-countup]"));
    if (!nums.length) return;

    const startAll = () => {
      nums.forEach((el) => {
        const target = parseInt(el.getAttribute("data-countup") || "0", 10);
        if (!Number.isFinite(target)) return;
        if (el.dataset.counted === "1") return;
        el.dataset.counted = "1";
        el.textContent = "0";
        animateCount(el, target);
      });
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach((el) => {
        const target = parseInt(el.getAttribute("data-countup") || "0", 10);
        el.textContent = Number.isFinite(target) ? String(target) : "0";
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            startAll();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );

    io.observe(section);
  };
})();
